import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { listCourses } from '@/lib/course-store';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

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

  return NextResponse.json({
    courses: rows.map((course) => ({
      id: course.id,
      userId: course.clerkUserId,
      title: course.title,
      topic: course.prompt,
      description: course.description || '',
      level: 'beginner',
      status: course.status === 'generating' ? 'draft' : 'ready',
      qaStatus: 'pass',
      createdAt: course.createdAt.toISOString(),
      chapters: []
    }))
  });
}
