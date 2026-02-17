import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/ai-progress-store';
import { getQueueJob } from '@/lib/ai-queue';
import { db } from '@/lib/db';
import { aiJobs } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function GET(_: Request, { params }: { params: { jobId: string } }) {
  const status = getJobStatus(params.jobId);
  const queueJob = getQueueJob(params.jobId);

  if (status || queueJob) {
    return NextResponse.json({ job: status, queue: queueJob });
  }

  if (!canUseDb) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  const rows = await db.select().from(aiJobs).where(eq(aiJobs.id, params.jobId)).limit(1);
  const dbJob = rows[0];

  if (!dbJob) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  return NextResponse.json({
    job: {
      jobId: dbJob.id,
      state: dbJob.status,
      progress: dbJob.progress,
      message: dbJob.message || dbJob.error || dbJob.status,
      attempts: dbJob.attempts,
      maxAttempts: dbJob.maxAttempts,
      deadLetteredAt: dbJob.deadLetteredAt?.toISOString() || null,
      updatedAt: dbJob.updatedAt.toISOString()
    }
  });
}
