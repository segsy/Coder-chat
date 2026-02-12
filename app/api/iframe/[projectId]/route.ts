import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  const html = `
  <html>
    <head>
      <style>
        body {font-family: Inter, Arial, sans-serif; margin: 0; padding: 2rem; background: #f8fafc;}
        .card {background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Generated Project: ${params.projectId}</h1>
        <p>This iframe renders saved/generated website output.</p>
      </div>
    </body>
  </html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
