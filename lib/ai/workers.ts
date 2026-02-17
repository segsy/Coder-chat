import { and, eq, inArray } from 'drizzle-orm';
import { generateCoursePlan } from '@/lib/ai';
import { assertWithinUsageLimit } from '@/lib/ai/usage';
import { updateProgress } from '@/lib/ai/progress';
import { recordUsageAndReportToStripe } from '@/lib/billing/usage';
import { db } from '@/lib/db';
import { aiJobs, chapters, courseRenders, courses, jobSteps, lessons } from '@/lib/db/schema';

export async function resetCourseOutline(courseId: string) {
  const activeJobs = await db
    .select({ id: aiJobs.id })
    .from(aiJobs)
    .where(and(eq(aiJobs.courseId, courseId), inArray(aiJobs.status, ['queued', 'processing'])));

  if (activeJobs.length > 0) {
    await db.delete(jobSteps).where(inArray(jobSteps.jobId, activeJobs.map((job) => job.id)));
    await db.delete(aiJobs).where(inArray(aiJobs.id, activeJobs.map((job) => job.id)));
  }

  await db.delete(lessons).where(eq(lessons.courseId, courseId));
  await db.delete(chapters).where(eq(chapters.courseId, courseId));
  await db.delete(courseRenders).where(eq(courseRenders.courseId, courseId));

  await db
    .update(courses)
    .set({
      status: 'draft',
      outline: {
        chapterCount: 0,
        lessonCount: 0
      },
      videoUrl: null
    })
    .where(eq(courses.id, courseId));

  await updateProgress(courseId, 'idle', 0, 'Outline reset safely. Ready to regenerate.');
}

export async function processJob(job: {
  id: string;
  courseId: string;
  clerkUserId: string;
  type: 'outline' | 'full';
}) {
  await assertWithinUsageLimit(job.clerkUserId);

  const [course] = await db.select().from(courses).where(eq(courses.id, job.courseId)).limit(1);
  if (!course || course.clerkUserId !== job.clerkUserId) {
    throw new Error('Course not found.');
  }

  await updateProgress(job.courseId, 'planning', 10, 'Generating course outline');
  await db.update(aiJobs).set({ progress: 10, message: 'Generating course outline', updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

  const generated = await generateCoursePlan({ prompt: course.prompt, userId: job.clerkUserId });

  await db.delete(lessons).where(eq(lessons.courseId, job.courseId));
  await db.delete(chapters).where(eq(chapters.courseId, job.courseId));

  const chapterRows = generated.chapters.map((chapter, index) => ({
    id: chapter.id,
    courseId: job.courseId,
    title: chapter.title,
    summary: chapter.summary,
    chapterOrder: index + 1
  }));

  if (chapterRows.length > 0) {
    await db.insert(chapters).values(chapterRows);
  }

  const totalLessons = generated.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  let inserted = 0;
  let estimatedTokens = 0;

  for (let chapterIndex = 0; chapterIndex < generated.chapters.length; chapterIndex += 1) {
    const chapter = generated.chapters[chapterIndex];
    await updateProgress(job.courseId, 'lessons', Math.max(20, Math.floor((inserted / Math.max(totalLessons, 1)) * 90)), `Generating lessons for ${chapter.title}`);

    for (let lessonIndex = 0; lessonIndex < chapter.lessons.length; lessonIndex += 1) {
      const lesson = chapter.lessons[lessonIndex];

      await db.insert(lessons).values({
        id: lesson.id,
        courseId: job.courseId,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        title: lesson.title,
        lessonOrder: chapterIndex * 100 + lessonIndex + 1,
        objective: lesson.objective,
        script: job.type === 'full' ? lesson.script : null,
        narration: job.type === 'full' ? lesson.narration : null,
        durationSeconds: 180,
        isFreePreview: chapterIndex === 0 && lessonIndex === 0
      });

      if (job.type === 'full') {
        estimatedTokens += Math.ceil(((lesson.script?.length || 0) + (lesson.narration?.length || 0)) / 4);
      }
      inserted += 1;
      const percent = Math.min(95, 20 + Math.floor((inserted / Math.max(totalLessons, 1)) * 75));
      await db.update(aiJobs).set({ progress: percent, message: `Generated ${lesson.title}`, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
      await updateProgress(job.courseId, 'scripts', percent, `Generated ${lesson.title}`);
    }
  }

  await db
    .update(courses)
    .set({
      status: 'ready',
      outline: {
        chapterCount: generated.chapters.length,
        lessonCount: totalLessons
      }
    })
    .where(eq(courses.id, job.courseId));

  if (job.type === 'full') {
    await recordUsageAndReportToStripe({
      clerkUserId: job.clerkUserId,
      jobId: job.id,
      tokens: Math.max(estimatedTokens, 1)
    });
  }

  await updateProgress(job.courseId, 'done', 100, job.type === 'full' ? 'Full course + narration ready. Downstream TTS/render jobs can run.' : 'Outline ready');
}
