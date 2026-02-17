import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { courseProgress } from '@/lib/db/schema';

export async function updateProgress(courseId: string, step: string, percent: number, message?: string) {
  const existing = await db.select().from(courseProgress).where(eq(courseProgress.courseId, courseId)).limit(1);

  if (!existing[0]) {
    await db.insert(courseProgress).values({
      courseId,
      step,
      percent,
      message: message || null,
      updatedAt: new Date()
    });
    return;
  }

  await db
    .update(courseProgress)
    .set({
      step,
      percent,
      message: message || null,
      updatedAt: new Date()
    })
    .where(eq(courseProgress.courseId, courseId));
}
