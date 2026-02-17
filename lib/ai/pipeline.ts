import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiJobs, chapters, courseProgress, courses, jobSteps, lessons } from '@/lib/db/schema';
import { processJob } from '@/lib/ai/workers';
import { processTtsJob } from '@/lib/ai/tts-worker';
import { processRenderJob } from '@/lib/video/render-worker';

export const PIPELINE = ['outline', 'scripts', 'narration', 'tts', 'render'] as const;

type PipelineStage = (typeof PIPELINE)[number];

const STAGE_WEIGHTS: Record<PipelineStage, number> = {
  outline: 15,
  scripts: 35,
  narration: 15,
  tts: 20,
  render: 15
};

const STAGE_MESSAGE: Record<PipelineStage, string> = {
  outline: 'Building course outline',
  scripts: 'Generating lesson scripts',
  narration: 'Producing narration',
  tts: 'Synthesizing lesson audio',
  render: 'Rendering final video'
};

async function upsertJobStep(params: {
  jobId: string;
  step: PipelineStage;
  status?: 'queued' | 'processing' | 'done' | 'failed' | 'skipped';
  progress?: number;
  message?: string;
  error?: string | null;
  outputs?: Record<string, unknown>;
  started?: boolean;
  finished?: boolean;
}) {
  const existing = await db.select().from(jobSteps).where(and(eq(jobSteps.jobId, params.jobId), eq(jobSteps.step, params.step))).limit(1);
  const now = new Date();

  if (!existing[0]) {
    await db.insert(jobSteps).values({
      jobId: params.jobId,
      step: params.step,
      status: params.status ?? 'queued',
      progress: params.progress ?? 0,
      message: params.message ?? null,
      error: params.error ?? null,
      outputs: params.outputs ?? null,
      startedAt: params.started ? now : null,
      finishedAt: params.finished ? now : null,
      updatedAt: now
    });
    return;
  }

  await db
    .update(jobSteps)
    .set({
      status: params.status ?? existing[0].status,
      progress: params.progress ?? existing[0].progress,
      message: params.message ?? existing[0].message,
      error: params.error === undefined ? existing[0].error : params.error,
      outputs: params.outputs ?? existing[0].outputs,
      startedAt: params.started ? existing[0].startedAt ?? now : existing[0].startedAt,
      finishedAt: params.finished ? now : existing[0].finishedAt,
      attempt: existing[0].attempt + (params.started ? 1 : 0),
      updatedAt: now
    })
    .where(eq(jobSteps.id, existing[0].id));
}

async function syncWeightedProgress(jobId: string, courseId: string, fallbackStep: PipelineStage, fallbackMessage: string) {
  const rows = await db.select().from(jobSteps).where(eq(jobSteps.jobId, jobId));

  let weighted = 0;
  for (const stage of PIPELINE) {
    const row = rows.find((item) => item.step === stage);
    const progress = row ? Math.max(0, Math.min(100, row.progress)) : 0;
    weighted += (STAGE_WEIGHTS[stage] * progress) / 100;
  }

  const percent = Math.floor(Math.max(0, Math.min(100, weighted)));

  await db.update(aiJobs).set({ progress: percent, message: fallbackMessage, updatedAt: new Date() }).where(eq(aiJobs.id, jobId));

  const activeStep = rows.find((row) => row.status === 'processing')?.step ?? fallbackStep;
  await updateCourseProgress(courseId, activeStep, percent, fallbackMessage);
}

async function updateCourseProgress(courseId: string, step: string, percent: number, message: string) {
  const existing = await db.select().from(courseProgress).where(eq(courseProgress.courseId, courseId)).limit(1);

  if (!existing[0]) {
    await db.insert(courseProgress).values({
      courseId,
      step,
      percent,
      message,
      updatedAt: new Date()
    });
    return;
  }

  await db
    .update(courseProgress)
    .set({
      step,
      percent,
      message,
      updatedAt: new Date()
    })
    .where(eq(courseProgress.courseId, courseId));
}

async function hasOutline(courseId: string) {
  const chapterRows = await db.select().from(chapters).where(eq(chapters.courseId, courseId)).limit(1);
  return Boolean(chapterRows[0]);
}

async function getLessons(courseId: string) {
  return db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(asc(lessons.lessonOrder));
}

async function runStage(job: { id: string; type: string; courseId: string; clerkUserId: string; externalId?: string | null }, stage: PipelineStage) {
  await upsertJobStep({ jobId: job.id, step: stage, status: 'processing', progress: 5, message: STAGE_MESSAGE[stage], started: true, error: null });
  await syncWeightedProgress(job.id, job.courseId, stage, STAGE_MESSAGE[stage]);

  if (stage === 'outline') {
    if (await hasOutline(job.courseId)) {
      await upsertJobStep({ jobId: job.id, step: 'outline', status: 'skipped', progress: 100, message: 'Outline already exists', finished: true });
      return;
    }

    await processJob({ id: job.id, courseId: job.courseId, clerkUserId: job.clerkUserId, type: 'outline' });
    await upsertJobStep({ jobId: job.id, step: 'outline', status: 'done', progress: 100, message: 'Outline complete', finished: true });
    return;
  }

  if (stage === 'scripts' || stage === 'narration') {
    const lessonRows = await getLessons(job.courseId);
    if (lessonRows.length === 0) {
      throw new Error('No lessons available. Generate outline first.');
    }

    const scriptsReady = lessonRows.every((lesson) => Boolean(lesson.script));
    const narrationReady = lessonRows.every((lesson) => Boolean(lesson.narration));

    if (stage === 'scripts' && scriptsReady) {
      await upsertJobStep({ jobId: job.id, step: 'scripts', status: 'skipped', progress: 100, message: 'Scripts already exist', finished: true });
      return;
    }

    if (stage === 'narration' && narrationReady) {
      await upsertJobStep({ jobId: job.id, step: 'narration', status: 'skipped', progress: 100, message: 'Narration already exists', finished: true });
      return;
    }

    if (job.type !== 'full') {
      throw new Error('Scripts/narration stage can only run for full jobs.');
    }

    // Existing content worker produces outline + scripts + narration in one run.
    await processJob({ id: job.id, courseId: job.courseId, clerkUserId: job.clerkUserId, type: 'full' });

    const lessonRowsAfter = await getLessons(job.courseId);
    const scriptsCount = lessonRowsAfter.filter((lesson) => Boolean(lesson.script)).length;
    const narrationCount = lessonRowsAfter.filter((lesson) => Boolean(lesson.narration)).length;

    await upsertJobStep({
      jobId: job.id,
      step: 'scripts',
      status: 'done',
      progress: 100,
      message: `Scripts ready (${scriptsCount}/${lessonRowsAfter.length})`,
      outputs: { scriptsCount, lessons: lessonRowsAfter.length },
      finished: true
    });

    await upsertJobStep({
      jobId: job.id,
      step: 'narration',
      status: 'done',
      progress: 100,
      message: `Narration ready (${narrationCount}/${lessonRowsAfter.length})`,
      outputs: { narrationCount, lessons: lessonRowsAfter.length },
      finished: true
    });

    return;
  }

  if (stage === 'tts') {
    await processTtsJob({ id: job.id, courseId: job.courseId });

    const lessonRows = await getLessons(job.courseId);
    const done = lessonRows.filter((lesson) => Boolean(lesson.audioUrl)).length;
    await upsertJobStep({
      jobId: job.id,
      step: 'tts',
      status: 'done',
      progress: 100,
      message: `TTS complete (${done}/${lessonRows.length})`,
      outputs: { audioLessons: done, totalLessons: lessonRows.length },
      finished: true
    });
    return;
  }

  if (stage === 'render') {
    await processRenderJob({ id: job.id, courseId: job.courseId, externalId: job.externalId });

    const [updatedJob] = await db.select().from(aiJobs).where(eq(aiJobs.id, job.id)).limit(1);
    const [course] = await db.select().from(courses).where(eq(courses.id, job.courseId)).limit(1);

    const renderDone = Boolean(course?.videoUrl);
    await upsertJobStep({
      jobId: job.id,
      step: 'render',
      status: renderDone ? 'done' : 'processing',
      progress: renderDone ? 100 : Math.max(updatedJob?.progress ?? 10, 10),
      message: renderDone ? 'Render completed' : 'Render in progress',
      outputs: renderDone ? { videoUrl: course?.videoUrl } : undefined,
      finished: renderDone
    });
  }
}

function pipelineForJobType(type: string): PipelineStage[] {
  if (type === 'outline') return ['outline'];
  if (type === 'full') return ['outline', 'scripts', 'narration'];
  if (type === 'tts') return ['tts'];
  if (type === 'render') return ['render'];
  return [];
}

export async function runPipeline(jobId: string) {
  const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, jobId)).limit(1);
  if (!job) throw new Error('Job not found.');

  const stages = pipelineForJobType(job.type);
  if (stages.length === 0) throw new Error(`Unknown job type: ${job.type}`);

  for (const stage of stages) {
    const existing = await db.select().from(jobSteps).where(and(eq(jobSteps.jobId, job.id), eq(jobSteps.step, stage))).limit(1);
    if (existing[0] && (existing[0].status === 'done' || existing[0].status === 'skipped')) {
      continue;
    }

    try {
      await runStage(job, stage);
      await syncWeightedProgress(job.id, job.courseId, stage, STAGE_MESSAGE[stage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stage failed';
      await upsertJobStep({ jobId: job.id, step: stage, status: 'failed', message, error: message, finished: true });
      await syncWeightedProgress(job.id, job.courseId, stage, `Stage failed: ${message}`);
      throw error;
    }
  }

  const stepRows = await db.select().from(jobSteps).where(eq(jobSteps.jobId, job.id));
  const failed = stepRows.find((row) => row.status === 'failed');
  if (failed) {
    throw new Error(failed.error || `Stage ${failed.step} failed`);
  }

  const allDone = stages.every((stage) => {
    const row = stepRows.find((item) => item.step === stage);
    return row && (row.status === 'done' || row.status === 'skipped');
  });

  if (allDone) {
    await db.update(aiJobs).set({ progress: 100, message: 'Pipeline complete', updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
    await updateCourseProgress(job.courseId, 'done', 100, 'Pipeline complete');
  }

  return { allDone };
}
