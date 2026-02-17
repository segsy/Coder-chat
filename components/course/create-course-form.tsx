'use client';

import { useActionState } from 'react';
import { createCourseAction, type CreateCourseState } from '@/actions/create-course';

const initialState: CreateCourseState = { ok: false };

export default function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border p-6">
      <div>
        <label className="text-sm font-medium">Course Title</label>
        <input name="title" placeholder="e.g., React for Beginners" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
        {state?.errors?.title ? <p className="mt-1 text-sm text-red-600">{state.errors.title}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium">Short Description (optional)</label>
        <input
          name="description"
          placeholder="What will learners achieve?"
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {state?.errors?.description ? <p className="mt-1 text-sm text-red-600">{state.errors.description}</p> : null}
      </div>

      <div>
        <label className="text-sm font-medium">Course Prompt</label>
        <textarea
          name="prompt"
          rows={6}
          placeholder="Write a detailed prompt. Example: Create a complete beginner course on React including chapters, lessons, and examples..."
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        />
        {state?.errors?.prompt ? <p className="mt-1 text-sm text-red-600">{state.errors.prompt}</p> : null}
      </div>

      {state?.errors?.form ? <p className="text-sm text-red-600">{state.errors.form}</p> : null}

      <button type="submit" disabled={pending} className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60">
        {pending ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}
