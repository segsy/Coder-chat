'use server';

import { enqueueOutline } from '@/actions/enqueue-generation';

export async function generateOutlineAction(courseId: string) {
  const job = await enqueueOutline(courseId);
  return { ok: true, jobId: job.id };
}
