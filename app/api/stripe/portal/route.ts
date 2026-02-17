import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function POST() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!canUseDb) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing app URL configuration.' }, { status: 400 });
  }

  const row = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, user.id)).limit(1);
  const sub = row[0];

  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found.' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`
  });

  return NextResponse.json({ url: session.url });
}
