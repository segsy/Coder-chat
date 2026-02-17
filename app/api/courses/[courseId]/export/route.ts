import { and, asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { chapters, courses, lessons } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  if (!canUseDb) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 400 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, params.courseId), eq(courses.clerkUserId, user.id)))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const [chapterRows, lessonRows] = await Promise.all([
    db.select().from(chapters).where(eq(chapters.courseId, course.id)).orderBy(asc(chapters.chapterOrder)),
    db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.lessonOrder))
  ]);

  const format = new URL(req.url).searchParams.get('format') || 'json';

  const payload = {
    id: course.id,
    title: course.title,
    prompt: course.prompt,
    description: course.description,
    status: course.status,
    chapters: chapterRows,
    lessons: lessonRows
  };

  if (format === 'markdown') {
    const chapterSections = chapterRows
      .map((chapter) => {
        const chapterLessons = lessonRows.filter((lesson) => lesson.chapterId === chapter.id);
        const lessonsMd = chapterLessons
          .map((lesson, index) => `### ${index + 1}. ${lesson.title}\n\n${lesson.script || '_No script yet._'}\n`)
          .join('\n');

        return `## ${chapter.chapterOrder}. ${chapter.title}\n\n${chapter.summary || ''}\n\n${lessonsMd}`;
      })
      .join('\n\n');

    const markdown = `# ${course.title}\n\n${course.description || ''}\n\n## Prompt\n\n${course.prompt}\n\n${chapterSections}`;

    return new NextResponse(markdown, {
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        'content-disposition': `attachment; filename="course-${course.id}.md"`
      }
    });
  }

  return NextResponse.json(payload, {
    headers: {
      'content-disposition': `attachment; filename="course-${course.id}.json"`
    }
  });
}
