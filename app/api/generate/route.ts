import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, projectId } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // System prompt for UI generation
    const systemPrompt = `You are an expert UI/UX engineer specializing in building modern, beautiful websites with Tailwind CSS.

Your task is to generate complete, production-ready HTML code based on the user's description.

Requirements:
1. Use Tailwind CSS via CDN (https://cdn.tailwindcss.com)
2. Create fully responsive, mobile-friendly layouts
3. Use modern design patterns (glassmorphism, gradients, subtle shadows)
4. Include all necessary HTML structure (doctype, head, body)
5. Use dark theme by default with beautiful color schemes
6. Include appropriate font families (Inter, system-ui)
7. Add smooth transitions and hover effects
8. Make it visually stunning with:
   - Gradient backgrounds
   - Subtle blur effects
   - Beautiful typography
   - Proper spacing and alignment
   - Interactive elements

Generate ONLY the HTML code - no explanations, no markdown code blocks, just pure HTML.`;

    // Call OpenAI to generate the website code
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedCode = completion.choices[0]?.message?.content;

    if (!generatedCode) {
      return NextResponse.json(
        { error: 'Failed to generate code' },
        { status: 500 }
      );
    }

    // Return the generated code
    return NextResponse.json({
      success: true,
      code: generatedCode,
      creditsUsed: 1,
      projectId,
    });

  } catch (error) {
    console.error('Error generating website:', error);
    
    // Check for specific error types
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'AI service error: ' + error.message },
        { status: error.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'AI Website Generation API',
    version: '1.0',
    endpoints: {
      POST: 'Generate website from prompt',
    },
  });
}
