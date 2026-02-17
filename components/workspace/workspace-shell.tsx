'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@/lib/course-types';
import { getFutureVideoPipeline } from '@/lib/ai/video-pipeline';

type JobState = {
  jobId: string;
  state: string;
  progress: number;
  message: string;
};

type QueueState = {
  queuePosition: number;
  status: string;
};

const levels: Array<Course['level']> = ['beginner', 'intermediate', 'advanced'];

export function WorkspaceShell({ projectId }: { projectId: string }) {
  const [prompt, setPrompt] = useState('Build a complete educational video course for TypeScript fundamentals.');
  const [level, setLevel] = useState<Course['level']>('beginner');
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<JobState | null>(null);
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [usageCost, setUsageCost] = useState<number | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseList, setCourseList] = useState<Course[]>([]);

  const totalLessons = useMemo(
    () => currentCourse?.chapters.reduce((count, chapter) => count + chapter.lessons.length, 0) ?? 0,
    [currentCourse]
  );

  const pollJob = async (jobId: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const progressRes = await fetch(`/api/ai/progress/${jobId}`);
      if (!progressRes.ok) return;
      const progressData = await progressRes.json();
      if (progressData.job) {
        setJob(progressData.job);
      }
      if (progressData.queue) {
        setQueue({ queuePosition: progressData.queue.queuePosition, status: progressData.queue.status });
      }

      if (progressData.job?.state === 'completed' || progressData.job?.state === 'failed') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const generateCourse = async () => {
    setLoading(true);
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, message: prompt, level })
    });

    const data = await res.json();

    if (data.jobId) {
      await pollJob(data.jobId);
    }

    if (typeof data.usageCostCents === 'number') {
      setUsageCost(data.usageCostCents);
    }

    if (data.course) {
      setCurrentCourse(data.course);
      setCourseList((prev) => [data.course, ...prev.filter((course) => course.id !== data.course.id)]);
    }
    setLoading(false);
  };

  const loadCourses = async () => {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourseList(data.courses || []);
  };

  const openCourse = async (courseId: string) => {
    const res = await fetch(`/api/courses/${courseId}`);
    if (!res.ok) return;

    const data = await res.json();
    setCurrentCourse(data.course);
  };

  const videoPipeline = getFutureVideoPipeline();

  return (
    <div className="grid min-h-screen grid-cols-12 gap-4 bg-slate-950 p-4 text-white">
      <aside className="col-span-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h2 className="font-semibold">Course Layout Generator</h2>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-3 min-h-36 bg-slate-950" />
        <div className="mt-3 flex gap-2">
          {levels.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setLevel(item)}
              className={`rounded-full px-3 py-1 text-xs capitalize ${item === level ? 'bg-blue-600' : 'bg-white/10'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-semibold text-zinc-300">AI Generation Queue + Progress</p>
          <p className="mt-2 text-xs text-zinc-400">
            {queue ? `Queue position: ${queue.queuePosition} (${queue.status})` : 'Queue is idle'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{job ? `${job.state} (${job.progress}%)` : 'No active job'}</p>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${job?.progress ?? 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">{job?.message}</p>
          {usageCost !== null ? <p className="mt-2 text-xs text-zinc-400">Usage billed: ${(usageCost / 100).toFixed(2)} per AI generation</p> : null}
        </div>

        <Button className="mt-3 w-full" onClick={generateCourse} disabled={loading}>
          {loading ? 'Generating...' : 'Generate AI Course'}
        </Button>
        <Button className="mt-2 w-full" variant="secondary" onClick={loadCourses}>
          Refresh Course List
        </Button>

        <h3 className="mt-6 text-sm font-semibold text-zinc-300">Display Course List</h3>
        <div className="mt-3 space-y-2 text-sm">
          {courseList.map((course) => (
            <button
              type="button"
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-left"
            >
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-zinc-400">{course.level} • QA {course.qaStatus} • {new Date(course.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
          {!courseList.length ? <p className="text-xs text-zinc-400">No courses yet. Generate one to get started.</p> : null}
        </div>
      </aside>

      <section className="col-span-5 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h2 className="font-semibold">Course Preview Screen</h2>
        {!currentCourse ? (
          <p className="mt-4 text-sm text-zinc-400">Your generated chapters and lessons will appear here.</p>
        ) : (
          <>
            <div className="mt-4 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3">
              <p className="text-lg font-semibold">{currentCourse.title}</p>
              <p className="text-sm text-zinc-300">{currentCourse.description}</p>
              <p className="mt-1 text-sm text-zinc-300">Topic: {currentCourse.topic}</p>
              <p className="text-sm text-zinc-300">{currentCourse.chapters.length} chapters • {totalLessons} lessons • QA {currentCourse.qaStatus}</p>
            </div>

            <div className="mt-4 space-y-3">
              {currentCourse.chapters.map((chapter, chapterIndex) => (
                <div key={chapter.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <h3 className="font-medium">Chapter {chapterIndex + 1}: {chapter.title}</h3>
                  <p className="text-sm text-zinc-400">{chapter.summary}</p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id}>• {lesson.title}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="col-span-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h2 className="font-semibold">Display Video (All Course Data)</h2>
        {!currentCourse ? (
          <p className="mt-4 text-sm text-zinc-400">Generate a course to view lesson scripts, narration, and video prompts.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {currentCourse.chapters.flatMap((chapter) =>
              chapter.lessons.map((lesson) => (
                <article key={lesson.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="mt-1 text-xs text-zinc-400">Objective: {lesson.objective}</p>
                  <p className="mt-2 text-sm text-zinc-300"><strong>Script:</strong> {lesson.script}</p>
                  <p className="mt-2 text-sm text-zinc-300"><strong>Narration:</strong> {lesson.narration}</p>
                  <p className="mt-2 text-xs text-zinc-400"><strong>Video prompt:</strong> {lesson.videoPrompt}</p>
                </article>
              ))
            )}

            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-xs font-semibold text-zinc-300">Future AI Video & TTS Pipeline</p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                {videoPipeline.map((step) => (
                  <li key={step.id}>• {step.name}: {step.description}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
