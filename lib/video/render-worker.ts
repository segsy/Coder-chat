import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiJobs, courseRenders, courses, lessons } from '@/lib/db/schema';
import { getLambdaRenderProgress, startLambdaRender } from '@/lib/video/remotion';

const RENDER_PRESET = '16:9-1080p';

const buildRenderOutName = (courseId: string, revision: number) => `courses/${courseId}/renders/${RENDER_PRESET}/v${revision}.mp4`;

export async function processRenderJob(job: {
  id: string;
  courseId: string;
  externalId?: string | null;
  forceRegenerate?: boolean;
}) {
  const [course] = await db.select().from(courses).where(eq(courses.id, job.courseId)).limit(1);
  if (!course) throw new Error('Course not found.');

  if (course.videoUrl && !job.forceRegenerate && !job.externalId) {
    await db.update(aiJobs).set({ progress: 100, message: 'Render already exists', updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
    return;
  }

  const lessonRows = await db.select().from(lessons).where(eq(lessons.courseId, job.courseId)).orderBy(asc(lessons.lessonOrder));
  if (lessonRows.length === 0) {
    throw new Error('No lessons available to render.');
  }

  if (!job.externalId) {
    const audioSrcs = lessonRows.map((lesson) => lesson.audioUrl || '').filter(Boolean);
    if (audioSrcs.length === 0) {
      throw new Error('Missing lesson audio. Run TTS first.');
    }

    const [lastRender] = await db.select().from(courseRenders).where(eq(courseRenders.courseId, job.courseId)).orderBy(desc(courseRenders.createdAt)).limit(1);
    const revision = job.forceRegenerate ? (lastRender ? 2 : 1) : 1;
    const outName = buildRenderOutName(job.courseId, revision);

    const started = await startLambdaRender({
      title: course.title,
      lessonTitles: lessonRows.map((lesson) => lesson.title),
      audioSrcs,
      outName
    });

    await db
      .insert(courseRenders)
      .values({
        courseId: job.courseId,
        status: 'processing',
        preset: RENDER_PRESET,
        renderProvider: 'remotion-lambda',
        videoKey: outName,
        updatedAt: new Date()
      });

    await db
      .update(aiJobs)
      .set({ externalId: started.renderId, progress: 5, message: 'Render started', updatedAt: new Date() })
      .where(eq(aiJobs.id, job.id));

    return;
  }

  const progress = await getLambdaRenderProgress(job.externalId);
  const pct = Math.max(5, Math.min(99, Math.floor((progress.overallProgress || 0) * 100)));

  await db.update(aiJobs).set({ progress: pct, message: progress.done ? 'Finalizing render' : 'Rendering video', updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

  if (progress.done && progress.outputFile) {
    await db.update(courses).set({ videoUrl: progress.outputFile }).where(eq(courses.id, job.courseId));
    await db
      .update(courseRenders)
      .set({ status: 'done', videoUrl: progress.outputFile, updatedAt: new Date() })
      .where(eq(courseRenders.courseId, job.courseId));
  }
}
