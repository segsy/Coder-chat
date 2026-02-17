'use client';

import { useEffect, useMemo, useState } from 'react';

type Stage = {
  step: string;
  status: string;
  progress: number;
  message?: string | null;
};

const labelForStep = (step: string) => {
  if (step === 'outline') return 'Outline';
  if (step === 'scripts') return 'Scripts';
  if (step === 'narration') return 'Narration';
  if (step === 'tts') return 'TTS';
  if (step === 'render') return 'Render';
  return step;
};

export function CourseProgress({ courseId }: { courseId: string }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch(`/api/courses/${courseId}/progress`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const nextProgress = data.progress ?? data.percent ?? 0;

      setProgress(nextProgress);
      setMessage(data.message || 'Working...');
      setStatus(data.status || data.step || 'idle');
      setStages(Array.isArray(data.stages) ? data.stages : []);

      if (nextProgress >= 100 || data.status === 'failed') {
        clearInterval(id);
      }
    }, 1500);

    return () => clearInterval(id);
  }, [courseId]);

  const activeStage = useMemo(
    () => stages.find((stage) => stage.status === 'processing') ?? stages.find((stage) => stage.status === 'failed') ?? null,
    [stages]
  );

  if (status === 'idle' || progress >= 100) return null;

  return (
    <div className="mt-4 rounded-xl border bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-800">{message || 'Working...'}</p>
        <p className="text-xs text-slate-600">{progress}%</p>
      </div>

      {activeStage ? (
        <p className="mt-1 text-xs text-slate-500">
          Current stage: <span className="font-medium text-slate-700">{labelForStep(activeStage.step)}</span>
          {activeStage.message ? ` — ${activeStage.message}` : ''}
        </p>
      ) : null}

      <div className="mt-2 h-2 w-full rounded bg-slate-200">
        <div className={`h-2 rounded transition-all ${status === 'failed' ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
