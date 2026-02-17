import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { courses, lessons } from '@/lib/db/schema';
import { uploadMp3ToS3 } from '@/lib/storage/s3';
import { synthesizeMp3 } from '@/lib/tts/azure-tts';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function POST(req: Request) {
  if (!canUseDb) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 400 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { lessonId?: string };
  if (!body.lessonId) {
    return NextResponse.json({ error: 'lessonId is required.' }, { status: 400 });
  }

  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, body.lessonId)).limit(1);
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  }

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, lesson.courseId), eq(courses.clerkUserId, user.id)))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  }

  const ttsText = lesson.narration || lesson.script;
  if (!ttsText) {
    return NextResponse.json({ error: 'Lesson has no script/narration to synthesize.' }, { status: 400 });
  }

  const mp3 = await synthesizeMp3(ttsText);
  const s3Key = `courses/${course.id}/audio/${lesson.id}.mp3`;
  const audioUrl = await uploadMp3ToS3(s3Key, mp3);

  await db.update(lessons).set({ audioUrl }).where(eq(lessons.id, lesson.id));

  return NextResponse.json({ ok: true, audioUrl });
}
