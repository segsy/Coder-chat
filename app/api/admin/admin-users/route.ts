import { NextResponse } from 'next/server';

const adminUsers = new Set<string>(['owner@bolt.new', 'ops@bolt.new']);

export async function GET() {
  return NextResponse.json({ admins: [...adminUsers] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  adminUsers.add(email);
  return NextResponse.json({ ok: true, admins: [...adminUsers] });
}
