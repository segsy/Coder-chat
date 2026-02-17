import { NextResponse } from 'next/server';
import { enqueueOutline, enqueueFull } from '@/actions/enqueue-generation';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { courseId?: string; type?: 'outline' | 'full'; reset?: boolean };
    if (!body.courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const job = body.type === 'full' ? await enqueueFull(body.courseId) : await enqueueOutline(body.courseId, { reset: Boolean(body.reset) });
    return NextResponse.json({ ok: true, jobId: job.id, reused: job.reused });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to enqueue generation job.';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
