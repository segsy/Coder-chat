import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    unsubscribed: true,
    feedback: {
      email: body.email,
      reason: body.reason || null,
      details: body.details || null
    }
  });
}
