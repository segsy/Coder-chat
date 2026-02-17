import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiJobs, courses, users } from '@/lib/db/schema';
import { runPipeline } from '@/lib/ai/pipeline';
import { updateProgress } from '@/lib/ai/progress';
import { enqueueGenerationJob } from '@/lib/ai/jobs';

async function maybeEnqueueDownstream(job: { courseId: string; clerkUserId: string; type: string }) {
  if (job.type !== 'full') return;

  const planRow = await db.select({ plan: users.plan }).from(users).where(eq(users.clerkUserId, job.clerkUserId)).limit(1);
  const plan = planRow[0]?.plan ?? 'free';
  if (plan !== 'pro') return;

  await enqueueGenerationJob(job.courseId, job.clerkUserId, 'tts');
  await enqueueGenerationJob(job.courseId, job.clerkUserId, 'render');
}

export async function POST() {
  const [job] = await db
    .select()
    .from(aiJobs)
    .where(and(eq(aiJobs.status, 'queued')))
    .orderBy(asc(aiJobs.createdAt))
    .limit(1);

  if (!job) {
    return Response.json({ ok: true, processed: 0 });
  }

  const nextAttempt = (job.attempts ?? 0) + 1;

  await db
    .update(aiJobs)
    .set({ status: 'processing', progress: Math.max(job.progress, 5), message: `Processing ${job.type} (attempt ${nextAttempt})`, attempts: nextAttempt, updatedAt: new Date() })
    .where(eq(aiJobs.id, job.id));

  try {
    const result = await runPipeline(job.id);

    if (!result.allDone && job.type === 'render') {
      await db.update(aiJobs).set({ status: 'queued', message: 'Render in progress', updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
      return Response.json({ ok: true, processed: 1, jobId: job.id, renderPolling: true });
    }

    await db.update(aiJobs).set({ status: 'done', progress: 100, message: `${job.type} completed`, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

    if (job.type === 'render' || job.type === 'full' || job.type === 'outline') {
      await db.update(courses).set({ status: 'ready' }).where(eq(courses.id, job.courseId));
    }

    await maybeEnqueueDownstream({
      courseId: job.courseId,
      clerkUserId: job.clerkUserId,
      type: job.type
    });

    return Response.json({ ok: true, processed: 1, jobId: job.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Job processing failed.';
    const maxAttempts = job.maxAttempts ?? 3;
    const shouldRetry = nextAttempt < maxAttempts;

    await db
      .update(aiJobs)
      .set({
        status: shouldRetry ? 'queued' : 'failed',
        progress: shouldRetry ? job.progress : 100,
        message: shouldRetry ? `Retry queued (${nextAttempt}/${maxAttempts})` : 'Moved to dead-letter state',
        error: message,
        deadLetteredAt: shouldRetry ? null : new Date(),
        updatedAt: new Date()
      })
      .where(eq(aiJobs.id, job.id));

    if (!shouldRetry) {
      await db.update(courses).set({ status: 'failed' }).where(eq(courses.id, job.courseId));
      await updateProgress(job.courseId, 'failed', 100, message);
      return Response.json({ ok: false, error: message, deadLettered: true }, { status: 500 });
    }

    await updateProgress(job.courseId, 'retrying', Math.max(0, job.progress), `Retrying generation (${nextAttempt}/${maxAttempts}).`);
    return Response.json({ ok: false, retrying: true, error: message }, { status: 202 });
  }
}
