'use server';

import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function createCheckoutSession({
  priceId,
  appUrl,
  customerEmail,
  clientReferenceId
}: {
  priceId: string;
  appUrl: string;
  customerEmail?: string;
  clientReferenceId?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      { price: priceId || process.env.STRIPE_PRO_PRICE_ID || '', quantity: 1 },
      { price: process.env.STRIPE_AI_METERED_PRICE_ID || '', quantity: 1 }
    ],
    customer_email: customerEmail,
    client_reference_id: clientReferenceId,
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    metadata: clientReferenceId ? { clerkUserId: clientReferenceId } : undefined
  });

  return session.url;
}

export async function createBillingPortalSession({ clerkUserId, appUrl }: { clerkUserId: string; appUrl: string }) {
  if (!canUseDb) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const row = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, clerkUserId)).limit(1);
  const customerId = row[0]?.stripeCustomerId;

  if (!customerId) {
    throw new Error('No Stripe customer found for this user.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/billing`
  });

  return session.url;
}
