import { and, eq, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiJobs, courses } from '@/lib/db/schema';

export type GenerationJobType = 'outline' | 'full' | 'tts' | 'render';

export async function enqueueGenerationJob(courseId: string, userId: string, type: GenerationJobType) {
  const existing = await db
    .select({ id: aiJobs.id })
    .from(aiJobs)
    .where(and(eq(aiJobs.courseId, courseId), eq(aiJobs.type, type), or(eq(aiJobs.status, 'queued'), eq(aiJobs.status, 'processing'))))
    .limit(1);

  if (existing[0]) {
    return { id: existing[0].id, reused: true };
  }

  const [job] = await db
    .insert(aiJobs)
    .values({
      courseId,
      clerkUserId: userId,
      type,
      status: 'queued',
      progress: 0,
      message: `Queued ${type} job`,
      attempts: 0,
      updatedAt: new Date()
    })
    .returning({ id: aiJobs.id });

  await db.update(courses).set({ status: 'generating' }).where(eq(courses.id, courseId));

  return { id: job.id, reused: false };
}
