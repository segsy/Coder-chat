import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, workspaces } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: 'No email found' }, { status: 400 });
  }

  if (!canUseDb) {
    return NextResponse.json({ ok: true, mode: 'skipped', reason: 'DATABASE_URL not configured' });
  }

  const existing = await db.select().from(users).where(eq(users.clerkUserId, user.id)).limit(1);

  if (!existing[0]) {
    // Create workspace first, then user
    const slug = `workspace-${user.id.slice(0, 8)}-${Date.now()}`;
    const [workspace] = await db
      .insert(workspaces)
      .values({
        clerkUserId: user.id,
        name: 'My Workspace',
        slug
      })
      .returning();

    await db.insert(users).values({
      clerkUserId: user.id,
      workspaceId: workspace.id,
      email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      imageUrl: user.imageUrl ?? null,
      plan: 'free'
    });

    return NextResponse.json({ ok: true, workspaceCreated: true });
  }

  return NextResponse.json({ ok: true, userExists: true });
}
