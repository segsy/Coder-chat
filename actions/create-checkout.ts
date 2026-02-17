'use server';

import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function createCheckoutAction() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('No email available for checkout');

  if (!process.env.STRIPE_PRO_PRICE_ID || !process.env.STRIPE_AI_METERED_PRICE_ID || !process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('Missing Stripe pricing environment variables');
  }

  let customerId: string | null = null;

  if (canUseDb) {
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, user.id)).limit(1);
    customerId = existing[0]?.stripeCustomerId || null;
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { clerkUserId: user.id }
    });
    customerId = customer.id;
  }

  if (canUseDb) {
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, user.id)).limit(1);
    if (!existing[0]) {
      await db.insert(subscriptions).values({
        clerkUserId: user.id,
        stripeCustomerId: customerId,
        status: 'inactive'
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      { price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 },
      { price: process.env.STRIPE_AI_METERED_PRICE_ID, quantity: 1 }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
    metadata: {
      clerkUserId: user.id
    }
  });

  redirect(session.url || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`);
}
