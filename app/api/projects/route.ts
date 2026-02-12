import { NextResponse } from 'next/server';

const inlineStore = new Map<string, Record<string, string>>();

export async function POST(req: Request) {
  const body = await req.json();
  const current = inlineStore.get(body.projectId) || {};
  current[body.selectedElement] = body.inlineEdit;
  inlineStore.set(body.projectId, current);

  return NextResponse.json({ ok: true, settings: current });
}

export async function GET() {
  return NextResponse.json({
    projects: [
      { id: 'demo', name: 'Demo Project', status: 'draft' },
      { id: 'demo-ecommerce', name: 'Ecommerce', status: 'draft' }
    ]
  });
}
