import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

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
    await db.insert(users).values({
      clerkUserId: user.id,
      email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      imageUrl: user.imageUrl ?? null,
      plan: 'free'
    });
  }

  return NextResponse.json({ ok: true });
}
