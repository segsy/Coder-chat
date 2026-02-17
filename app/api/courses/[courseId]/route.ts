import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { getCourse } from '@/lib/course-store';
import { db } from '@/lib/db';
import { courses, lessons } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function GET(_: Request, { params }: { params: { courseId: string } }) {
  const memoryCourse = getCourse(params.courseId);
  if (memoryCourse) {
    return NextResponse.json({ course: memoryCourse });
  }

  if (!canUseDb) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const authUser = await currentUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const row = await db.select().from(courses).where(eq(courses.id, params.courseId)).limit(1);
  if (!row[0] || row[0].clerkUserId !== authUser.id) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
  }

  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, params.courseId));

  return NextResponse.json({
    course: {
      id: row[0].id,
      userId: row[0].clerkUserId,
      title: row[0].title,
      topic: row[0].prompt,
      description: row[0].description || '',
      level: 'beginner',
      status: row[0].status === 'generating' ? 'draft' : 'ready',
      qaStatus: 'pass',
      createdAt: row[0].createdAt.toISOString(),
      chapters: [
        {
          id: 'db-chapter',
          title: 'Persisted Lessons',
          summary: 'Loaded from Neon database.',
          lessons: courseLessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            objective: lesson.objective || '',
            script: lesson.script || '',
            narration: lesson.narration || '',
            videoPrompt: ''
          }))
        }
      ]
    }
  });
}
