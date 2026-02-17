import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { createCourseFromPrompt } from '@/actions/create-course';
import { generateCoursePlan } from '@/lib/ai';
import { saveCourse } from '@/lib/course-store';
import { upsertJobStatus } from '@/lib/ai-progress-store';
import { enqueueJob, updateQueueJob } from '@/lib/ai-queue';
import { trackUsage } from '@/lib/usage-store';
import { db } from '@/lib/db';
import { assertWithinUsageLimit } from '@/lib/ai/usage';
import { recordUsageAndReportToStripe } from '@/lib/billing/usage';
import { chapters, courses, lessons, usageEvents } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);
const AI_GENERATION_COST_CENTS = 25;

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.message || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'A course prompt is required.' }, { status: 400 });
  }

  const authUser = await currentUser();
  const userId = authUser?.id || 'anonymous';

  if (authUser && canUseDb) {
    try {
      await assertWithinUsageLimit(userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI usage limit reached.';
      return NextResponse.json({ error: message }, { status: 402 });
    }
  }

  const jobId = randomUUID();
  const queued = enqueueJob({
    jobId,
    clerkUserId: userId,
    prompt: body.message,
    status: 'queued',
    progress: 5,
    message: 'Queued for AI generation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  upsertJobStatus({
    jobId,
    state: 'queued',
    progress: 5,
    message: `Queued at position ${queued.queuePosition}.`,
    updatedAt: new Date().toISOString()
  });

  const createResult = await createCourseFromPrompt({
    prompt: body.message,
    title: body.title,
    description: body.description
  });

  if (!createResult.ok || !createResult.courseId) {
    updateQueueJob(jobId, { status: 'failed', progress: 100, message: createResult.error || 'Course creation failed.' });
    upsertJobStatus({
      jobId,
      state: 'failed',
      progress: 100,
      message: createResult.error || 'Unable to create course.',
      updatedAt: new Date().toISOString()
    });
    return NextResponse.json({ error: createResult.error, jobId }, { status: 400 });
  }

  if (canUseDb) {
    await db.update(courses).set({ status: 'generating' }).where(eq(courses.id, createResult.courseId));
  }

  updateQueueJob(jobId, { status: 'planning', progress: 25, message: 'Planner agent creating chapter plan.' });
  upsertJobStatus({
    jobId,
    state: 'planning',
    progress: 25,
    message: 'Planner agent creating chapter plan.',
    updatedAt: new Date().toISOString()
  });

  const generated = await generateCoursePlan({ prompt: body.message, level: body.level, userId });

  updateQueueJob(jobId, { status: 'generating', progress: 70, message: 'Script and narration agents generating lesson content.' });
  upsertJobStatus({
    jobId,
    state: 'generating',
    progress: 70,
    message: 'Script and narration agents generating lesson content.',
    updatedAt: new Date().toISOString()
  });

  const hydrated = {
    ...generated,
    id: createResult.courseId,
    title: createResult.title || generated.title,
    topic: body.message,
    description: body.description || generated.description
  };
  saveCourse(hydrated);

  if (canUseDb) {
    await db.delete(lessons).where(eq(lessons.courseId, createResult.courseId));
    await db.delete(chapters).where(eq(chapters.courseId, createResult.courseId));

    const chapterRows = hydrated.chapters.map((chapter, index) => ({
      id: chapter.id,
      courseId: createResult.courseId as string,
      title: chapter.title,
      summary: chapter.summary,
      chapterOrder: index + 1
    }));

    if (chapterRows.length > 0) {
      await db.insert(chapters).values(chapterRows);
    }

    const lessonRows = hydrated.chapters.flatMap((chapter, chapterIndex) =>
      chapter.lessons.map((lesson, lessonIndex) => ({
        id: lesson.id,
        courseId: createResult.courseId as string,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        title: lesson.title,
        lessonOrder: chapterIndex * 100 + lessonIndex + 1,
        objective: lesson.objective,
        script: lesson.script,
        narration: lesson.narration,
        isFreePreview: chapterIndex === 0 && lessonIndex === 0
      }))
    );

    if (lessonRows.length > 0) {
      await db.insert(lessons).values(lessonRows);
    }

    await db
      .update(courses)
      .set({
        status: 'ready',
        outline: {
          chapterCount: hydrated.chapters.length,
          lessonCount: lessonRows.length
        }
      })
      .where(eq(courses.id, createResult.courseId));

    await db.insert(usageEvents).values({
      clerkUserId: userId,
      courseId: createResult.courseId,
      eventType: 'ai_generation',
      units: 1,
      unitCostCents: AI_GENERATION_COST_CENTS
    });
  }

  if (canUseDb && authUser) {
    const estimatedTokens = Math.max(
      1,
      Math.ceil(
        hydrated.chapters.reduce((total, chapter) =>
          total +
          chapter.lessons.reduce(
            (sum, lesson) => sum + (lesson.script?.length || 0) + (lesson.narration?.length || 0),
            0
          ),
        0) / 4
      )
    );

    await recordUsageAndReportToStripe({ clerkUserId: userId, jobId, tokens: estimatedTokens });
  }

  trackUsage({
    id: randomUUID(),
    clerkUserId: userId,
    courseId: createResult.courseId,
    eventType: 'ai_generation',
    units: 1,
    unitCostCents: AI_GENERATION_COST_CENTS,
    createdAt: new Date().toISOString()
  });

  updateQueueJob(jobId, { status: 'completed', progress: 100, message: 'AI pipeline completed.' });
  upsertJobStatus({
    jobId,
    state: 'completed',
    progress: 100,
    message: 'AI pipeline completed.',
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({
    reply: `Generated course ${hydrated.title}.`,
    jobId,
    course: hydrated,
    courseId: createResult.courseId,
    usageCostCents: AI_GENERATION_COST_CENTS
  });
}
