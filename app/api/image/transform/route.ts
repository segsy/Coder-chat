import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { path, prompt } = await req.json();
  const transformedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${path}?tr=e-aiUpscale,e-contrast`;

  return NextResponse.json({ transformedUrl, prompt });
}
