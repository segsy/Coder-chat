import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { chapters, courses, lessons } from '@/lib/db/schema';
import { enqueueFull, enqueueOutline, enqueueRender, enqueueTts, regenerateOutline } from '@/actions/enqueue-generation';
import { enqueueFullPipeline } from '@/actions/enqueue-pipeline';
import { CourseProgress } from '@/components/course/course-progress';

const canUseDb = Boolean(process.env.DATABASE_URL);

export default async function CoursePage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user || !canUseDb) return null;

  const [course] = await db.select().from(courses).where(eq(courses.id, params.id)).limit(1);
  if (!course || course.clerkUserId !== user.id) return notFound();

  const [chs, lss] = await Promise.all([
    db.select().from(chapters).where(eq(chapters.courseId, course.id)).orderBy(asc(chapters.chapterOrder)),
    db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.lessonOrder))
  ]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard" className="text-sm underline">
          ← Back to dashboard
        </Link>

        <div className="rounded-2xl border bg-white/70 p-6">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="mt-1 text-sm text-slate-600">Status: {course.status}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <form
              action={async () => {
                'use server';
                await enqueueOutline(course.id);
              }}
            >
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Generate Outline</button>
            </form>

            <form
              action={async () => {
                'use server';
                await enqueueFull(course.id);
              }}
            >
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">Generate Full Course (Pro)</button>
            </form>

            <form
              action={async () => {
                'use server';
                await regenerateOutline(course.id);
              }}
            >
              <button className="rounded-lg border px-4 py-2 text-sm">Regenerate Outline</button>
            </form>

            <form
              action={async () => {
                'use server';
                await enqueueTts(course.id);
              }}
            >
              <button className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Generate Audio (TTS)</button>
            </form>

            <form
              action={async () => {
                'use server';
                await enqueueRender(course.id);
              }}
            >
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Render Video</button>
            </form>

            <form
              action={async () => {
                'use server';
                await enqueueFullPipeline(course.id);
              }}
            >
              <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">One Click Pipeline (Full → TTS → Render)</button>
            </form>
          </div>

          <CourseProgress courseId={course.id} />

          <div className="mt-4 flex gap-3 text-sm">
            <Link className="underline" href={`/api/courses/${course.id}/export?format=json`}>
              Export JSON
            </Link>
            <Link className="underline" href={`/api/courses/${course.id}/export?format=markdown`}>
              Export Markdown
            </Link>
          </div>


          {course.videoUrl ? (
            <div className="mt-4">
              <h2 className="text-sm font-semibold">Rendered Video</h2>
              <video className="mt-2 w-full rounded-xl border" controls src={course.videoUrl} />
            </div>
          ) : null}

          <div className="mt-6">
            <h2 className="text-sm font-semibold">Prompt</h2>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm">{course.prompt}</pre>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white/70 p-6">
            <h2 className="text-lg font-semibold">Chapters</h2>
            {chs.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No chapters yet.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">#</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {chs.map((chapter) => (
                    <tr key={chapter.id} className="border-t">
                      <td className="py-2 pr-3 text-slate-500">{chapter.chapterOrder}</td>
                      <td className="py-2">{chapter.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-2xl border bg-white/70 p-6">
            <h2 className="text-lg font-semibold">Lessons</h2>
            {lss.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No lessons yet.</p>
            ) : (
              <table className="mt-3 w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">#</th>
                    <th>Title</th>
                    <th className="text-right">Script</th>
                    <th className="text-right">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {lss.map((lesson) => (
                    <tr key={lesson.id} className="border-t">
                      <td className="py-2 pr-3 text-slate-500">{lesson.lessonOrder}</td>
                      <td className="py-2">{lesson.title}</td>
                      <td className="py-2 text-right text-slate-600">{lesson.script ? '✅' : '—'}</td>
                      <td className="py-2 text-right text-slate-600">{lesson.audioUrl ? '🔊' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
