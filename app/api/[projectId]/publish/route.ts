import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: { projectId: string } }) {
  return NextResponse.json({
    ok: true,
    message: `Project ${params.projectId} published successfully.`
  });
}
