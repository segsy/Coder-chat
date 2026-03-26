import { NextResponse } from 'next/server';
import { desc, eq, count, sql } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { listCourses } from '@/lib/course-store';
import { db } from '@/lib/db';
import { courses, chapters, lessons } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

const CreateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80),
  prompt: z.string().min(20, 'Prompt must be at least 20 characters').max(2000),
  description: z.string().max(300).optional().or(z.literal(''))
});

export async function GET() {
  if (!canUseDb) {
    return NextResponse.json({ courses: listCourses() });
  }

  const authUser = await currentUser();
  if (!authUser) {
    return NextResponse.json({ courses: [] });
  }

  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.clerkUserId, authUser.id))
    .orderBy(desc(courses.createdAt));

  // Get chapter and lesson counts for each course
  const courseIds = rows.map(c => c.id);
  
  let chapterCounts: { courseId: string; _count: number }[] = [];
  let lessonCounts: { courseId: string; _count: number }[] = [];
  
  if (courseIds.length > 0) {
    chapterCounts = await db
      .select({ courseId: chapters.courseId, _count: sql<number>`count(*)` })
      .from(chapters)
      .where(sql`${chapters.courseId} IN ${courseIds}`)
      .groupBy(chapters.courseId);
    
    lessonCounts = await db
      .select({ courseId: lessons.courseId, _count: sql<number>`count(*)` })
      .from(lessons)
      .where(sql`${lessons.courseId} IN ${courseIds}`)
      .groupBy(lessons.courseId);
  }

  const getChapterCount = (courseId: string) => 
    chapterCounts.find(c => c.courseId === courseId)?._count || 0;
  const getLessonCount = (courseId: string) => 
    lessonCounts.find(l => l.courseId === courseId)?._count || 0;

  return NextResponse.json({
    courses: rows.map((course) => ({
      id: course.id,
      userId: course.clerkUserId,
      title: course.title,
      topic: course.prompt,
      description: course.description || '',
      level: 'beginner',
      status: course.status,
      qaStatus: 'pass',
      createdAt: course.createdAt.toISOString(),
      chapters: [],
      _count: {
        chapters: getChapterCount(course.id),
        lessons: getLessonCount(course.id)
      }
    }))
  });
}

export async function POST(request: Request) {
  if (!canUseDb) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 500 });
  }

  const authUser = await currentUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateCourseSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message).join(', ');
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const { title, prompt, description } = parsed.data;

  const [created] = await db
    .insert(courses)
    .values({
      clerkUserId: authUser.id,
      title: title.trim(),
      prompt: prompt.trim(),
      description: description?.trim() || null,
      status: 'draft'
    })
    .returning({ id: courses.id, title: courses.title });

  return NextResponse.json({ 
    ok: true, 
    courseId: created.id, 
    title: created.title 
  });
}
