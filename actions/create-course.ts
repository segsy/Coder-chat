'use server';

import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { courses, users } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

const CreateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80),
  prompt: z.string().min(20, 'Prompt must be at least 20 characters').max(2000),
  description: z.string().max(300).optional().or(z.literal(''))
});

export type CreateCourseState = {
  ok: boolean;
  errors?: Record<string, string>;
};

export async function createCourseFromPrompt(input: { prompt: string; title?: string; description?: string }) {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'Unauthorized' };
  if (!canUseDb) return { ok: false, error: 'DATABASE_URL is not configured.' };

  const dbUser = await db.select({ plan: users.plan }).from(users).where(eq(users.clerkUserId, user.id)).limit(1);

  if ((dbUser[0]?.plan ?? 'free') === 'free') {
    const existing = await db.select({ id: courses.id }).from(courses).where(eq(courses.clerkUserId, user.id)).limit(1);

    if (existing.length >= 1) {
      return { ok: false, error: 'Free plan allows only 1 course. Upgrade to Pro to create more.' };
    }
  }

  const title = input.title?.trim() || `${input.prompt.slice(0, 50)}${input.prompt.length > 50 ? '...' : ''}`;

  const [created] = await db
    .insert(courses)
    .values({
      clerkUserId: user.id,
      title,
      prompt: input.prompt.trim(),
      description: input.description?.trim() || null,
      status: 'draft'
    })
    .returning({ id: courses.id, title: courses.title });

  revalidatePath('/dashboard');
  return { ok: true, courseId: created.id, title: created.title };
}

export async function createCourseAction(_prevState: CreateCourseState, formData: FormData): Promise<CreateCourseState> {
  const user = await currentUser();
  if (!user) return { ok: false, errors: { form: 'Unauthorized' } };

  const parsed = CreateCourseSchema.safeParse({
    title: formData.get('title'),
    prompt: formData.get('prompt'),
    description: formData.get('description')
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const result = await createCourseFromPrompt({
    title: parsed.data.title,
    prompt: parsed.data.prompt,
    description: parsed.data.description || undefined
  });

  if (!result.ok || !result.courseId) {
    return { ok: false, errors: { form: result.error || 'Unable to create course.' } };
  }

  redirect(`/dashboard/courses/${result.courseId}`);
  return { ok: true };
}

export async function listMyCourses() {
  const user = await currentUser();
  if (!user || !canUseDb) return [];

  return db.select().from(courses).where(eq(courses.clerkUserId, user.id)).orderBy(desc(courses.createdAt)).limit(20);
}
