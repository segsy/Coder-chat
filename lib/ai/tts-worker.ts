import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiJobs, lessons } from '@/lib/db/schema';
import { uploadMp3ToS3 } from '@/lib/storage/s3';
import { synthesizeMp3 } from '@/lib/tts/azure-tts';

const lessonAudioKey = (lessonId: string, revision: number) => `lessons/${lessonId}/v${revision}.mp3`;

export async function processTtsJob(job: { id: string; courseId: string; forceRegenerate?: boolean }) {
  const allLessons = await db.select().from(lessons).where(eq(lessons.courseId, job.courseId)).orderBy(asc(lessons.lessonOrder));
  if (allLessons.length === 0) {
    throw new Error('No lessons available. Generate course content first.');
  }

  const scriptReady = allLessons.filter((lesson) => lesson.narration || lesson.script);
  if (scriptReady.length === 0) {
    throw new Error('No narration/script found. Generate full course first.');
  }

  let done = 0;
  for (const lesson of scriptReady) {
    const sourceText = lesson.narration || lesson.script;
    if (!sourceText) continue;

    const hasAudio = Boolean(lesson.audioUrl && lesson.audioKey);
    if (hasAudio && !job.forceRegenerate) {
      done += 1;
      const progress = Math.min(99, Math.floor((done / scriptReady.length) * 95) + 5);
      await db.update(aiJobs).set({ progress, message: `TTS ${done}/${scriptReady.length} (cached)`, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
      continue;
    }

    const nextRevision = job.forceRegenerate ? (lesson.assetRevision ?? 1) + 1 : lesson.assetRevision ?? 1;
    const key = lessonAudioKey(lesson.id, nextRevision);

    const audio = await synthesizeMp3(sourceText);
    const audioUrl = await uploadMp3ToS3(key, audio);

    await db
      .update(lessons)
      .set({
        audioKey: key,
        audioUrl,
        assetRevision: nextRevision
      })
      .where(eq(lessons.id, lesson.id));

    done += 1;
    const progress = Math.min(99, Math.floor((done / scriptReady.length) * 95) + 5);
    await db.update(aiJobs).set({ progress, message: `TTS ${done}/${scriptReady.length}`, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));
  }
}
