import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projects, users } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

// GET /api/projects - Get user's projects
export async function GET() {
  if (!canUseDb) {
    // Return demo data if no database
    return NextResponse.json({ 
      projects: [
        { id: 'demo-1', name: 'SaaS Landing Page', prompt: 'Modern SaaS landing page', status: 'draft', thumbnailUrl: null, creditsUsed: 1, createdAt: new Date().toISOString() },
        { id: 'demo-2', name: 'Ecommerce Store', prompt: 'Ecommerce product page', status: 'published', thumbnailUrl: null, creditsUsed: 2, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]
    });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get projects for this user
  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clerkUserId, user.id))
    .orderBy(projects.createdAt);

  return NextResponse.json({ projects: userProjects });
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  if (!canUseDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body as { name?: string };

  if (!name) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const [project] = await db
    .insert(projects)
    .values({
      clerkUserId: user.id,
      name,
      prompt: '',
      status: 'draft'
    })
    .returning();

  return NextResponse.json({ project }, { status: 201 });
}
