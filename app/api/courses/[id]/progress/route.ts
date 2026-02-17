import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { aiJobs, courseProgress, courses, jobSteps } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!canUseDb) {
    return NextResponse.json({ percent: 0, progress: 0, step: 'idle', message: 'Database not configured.', status: 'idle' });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ownCourse = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, params.id), eq(courses.clerkUserId, user.id)))
    .limit(1);

  if (!ownCourse[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const [progressRow, latestJob] = await Promise.all([
    db.select().from(courseProgress).where(eq(courseProgress.courseId, params.id)).limit(1),
    db.select().from(aiJobs).where(eq(aiJobs.courseId, params.id)).orderBy(desc(aiJobs.createdAt)).limit(1)
  ]);

  const latest = latestJob[0];
  const stepRows = latest ? await db.select().from(jobSteps).where(eq(jobSteps.jobId, latest.id)) : [];

  const percent = progressRow[0]?.percent ?? latest?.progress ?? 0;

  return NextResponse.json({
    percent,
    progress: percent,
    step: progressRow[0]?.step ?? latest?.status ?? 'idle',
    status: latest?.status ?? 'idle',
    attempts: latest?.attempts ?? 0,
    maxAttempts: latest?.maxAttempts ?? 0,
    message: progressRow[0]?.message ?? latest?.message ?? latest?.error ?? 'No progress yet.',
    error: latest?.error || null,
    deadLetteredAt: latest?.deadLetteredAt?.toISOString() || null,
    stages: stepRows.map((row) => ({
      step: row.step,
      status: row.status,
      progress: row.progress,
      message: row.message
    }))
  });
}
