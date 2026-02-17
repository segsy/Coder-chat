'use server';

import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { courses, users } from '@/lib/db/schema';
import { enqueueGenerationJob } from '@/lib/ai/jobs';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function enqueueFullPipeline(courseId: string) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course || course.clerkUserId !== user.id) {
    throw new Error('Not allowed');
  }

  const planRow = await db.select({ plan: users.plan }).from(users).where(eq(users.clerkUserId, user.id)).limit(1);
  const plan = planRow[0]?.plan ?? 'free';
  if (plan !== 'pro') {
    throw new Error('Upgrade to Pro to run full pipeline.');
  }

  const [fullJob, ttsJob, renderJob] = await Promise.all([
    enqueueGenerationJob(courseId, user.id, 'full'),
    enqueueGenerationJob(courseId, user.id, 'tts'),
    enqueueGenerationJob(courseId, user.id, 'render')
  ]);

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/worker`, {
    method: 'POST',
    cache: 'no-store'
  });

  revalidatePath(`/dashboard/courses/${courseId}`);

  return {
    ok: true,
    jobs: {
      fullJobId: fullJob.id,
      ttsJobId: ttsJob.id,
      renderJobId: renderJob.id
    }
  };
}
