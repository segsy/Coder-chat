'use server';

import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { courses, users } from '@/lib/db/schema';
import { enqueueGenerationJob } from '@/lib/ai/jobs';
import { resetCourseOutline } from '@/lib/ai/workers';

const canUseDb = Boolean(process.env.DATABASE_URL);

async function getOwnedCourse(courseId: string, clerkUserId: string) {
  const rows = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  const course = rows[0];
  if (!course || course.clerkUserId !== clerkUserId) {
    throw new Error('Not allowed');
  }

  return course;
}

async function assertPlan(clerkUserId: string) {
  const row = await db.select({ plan: users.plan }).from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return row[0]?.plan ?? 'free';
}

async function triggerWorker() {
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/worker`, {
    method: 'POST',
    cache: 'no-store'
  });
}

export async function enqueueOutline(courseId: string, options?: { reset?: boolean }) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  await getOwnedCourse(courseId, user.id);

  if (options?.reset) {
    await resetCourseOutline(courseId);
  }

  const job = await enqueueGenerationJob(courseId, user.id, 'outline');
  await triggerWorker();
  revalidatePath(`/dashboard/courses/${courseId}`);

  return job;
}

export async function enqueueFull(courseId: string) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  await getOwnedCourse(courseId, user.id);

  const plan = await assertPlan(user.id);
  if (plan !== 'pro') {
    throw new Error('Upgrade to Pro to generate full scripts and narration.');
  }

  const job = await enqueueGenerationJob(courseId, user.id, 'full');
  await triggerWorker();
  revalidatePath(`/dashboard/courses/${courseId}`);

  return job;
}

export async function enqueueTts(courseId: string) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  await getOwnedCourse(courseId, user.id);

  const job = await enqueueGenerationJob(courseId, user.id, 'tts');
  await triggerWorker();
  revalidatePath(`/dashboard/courses/${courseId}`);

  return job;
}

export async function enqueueRender(courseId: string) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  await getOwnedCourse(courseId, user.id);

  const plan = await assertPlan(user.id);
  if (plan !== 'pro') {
    throw new Error('Upgrade to Pro to render course video.');
  }

  const job = await enqueueGenerationJob(courseId, user.id, 'render');
  await triggerWorker();
  revalidatePath(`/dashboard/courses/${courseId}`);

  return job;
}

export async function regenerateOutline(courseId: string) {
  return enqueueOutline(courseId, { reset: true });
}
