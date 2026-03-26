import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { workspaces, users } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

// GET /api/workspaces - Get user's workspace
export async function GET() {
  if (!canUseDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from database to find workspace
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, user.id))
    .limit(1);

  if (!dbUser || !dbUser.workspaceId) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, dbUser.workspaceId))
    .limit(1);

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

// POST /api/workspaces - Create a workspace for the user
export async function POST() {
  if (!canUseDb) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user already has a workspace
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, user.id))
    .limit(1);

  if (existingUser?.workspaceId) {
    return NextResponse.json({ error: 'Workspace already exists' }, { status: 400 });
  }

  // Create workspace with unique slug
  const slug = `workspace-${user.id.slice(0, 8)}-${Date.now()}`;
  
  const [workspace] = await db
    .insert(workspaces)
    .values({
      clerkUserId: user.id,
      name: 'My Workspace',
      slug
    })
    .returning();

  // Update user with workspace ID
  await db
    .update(users)
    .set({ workspaceId: workspace.id })
    .where(eq(users.clerkUserId, user.id));

  return NextResponse.json({ workspace }, { status: 201 });
}