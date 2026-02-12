import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await imagekit.upload({
    file: body.file,
    fileName: body.fileName || 'generated-image.png'
  });

  return NextResponse.json(result);
}
