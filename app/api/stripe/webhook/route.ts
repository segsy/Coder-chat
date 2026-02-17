import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { subscriptions, users } from '@/lib/db/schema';
import { upsertSubscription } from '@/lib/subscription-store';

const canUseDb = Boolean(process.env.DATABASE_URL);

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(['active', 'trialing']);

const normalizePlan = (status: string): 'free' | 'pro' => (ACTIVE_STATUSES.has(status as Stripe.Subscription.Status) ? 'pro' : 'free');

async function upsertDbSubscription(input: {
  clerkUserId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: string;
  meteredSubscriptionItemId?: string | null;
}) {
  if (!canUseDb) return;

  const existing = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, input.clerkUserId)).limit(1);
  if (!existing[0]) {
    await db.insert(subscriptions).values({
      clerkUserId: input.clerkUserId,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      meteredSubscriptionItemId: input.meteredSubscriptionItemId || null,
      status: input.status
    });
  } else {
    await db
      .update(subscriptions)
      .set({
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        meteredSubscriptionItemId: input.meteredSubscriptionItemId || null,
        status: input.status
      })
      .where(eq(subscriptions.clerkUserId, input.clerkUserId));
  }
}

async function setUserPlan(clerkUserId: string, plan: 'free' | 'pro') {
  if (!canUseDb) return;
  await db.update(users).set({ plan }).where(eq(users.clerkUserId, clerkUserId));
}

async function getClerkUserIdFromCustomerId(customerId: string): Promise<string> {
  if (!customerId) return '';

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    return '';
  }

  return customer.metadata?.clerkUserId || '';
}

function getMeteredItemId(subscription: Stripe.Subscription): string | null {
  const meteredPriceId = process.env.STRIPE_AI_METERED_PRICE_ID;

  if (!meteredPriceId) return null;

  const meteredItem = subscription.items.data.find((item) => item.price.id === meteredPriceId);
  return meteredItem?.id || null;
}

async function syncSubscriptionByObject(subscription: Stripe.Subscription, customerId: string, clerkUserId: string) {
  const meteredSubscriptionItemId = getMeteredItemId(subscription);
  const plan = normalizePlan(subscription.status);

  await upsertDbSubscription({
    clerkUserId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    meteredSubscriptionItemId,
    status: subscription.status
  });

  await setUserPlan(clerkUserId, plan);

  upsertSubscription({
    userId: clerkUserId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    meteredSubscriptionItemId,
    status: subscription.status,
    plan,
    updatedAt: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Invalid signature configuration', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== 'subscription') {
      return NextResponse.json({ received: true });
    }

    const customerId = String(session.customer || '');
    const subscriptionId = String(session.subscription || '');
    const clerkUserId = (session.metadata?.clerkUserId as string | undefined) || (await getClerkUserIdFromCustomerId(customerId));

    if (clerkUserId && customerId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionByObject(subscription, customerId, clerkUserId);
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = String(sub.customer || '');

    let clerkUserId = await getClerkUserIdFromCustomerId(customerId);

    if (!clerkUserId && canUseDb) {
      const existing = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, customerId)).limit(1);
      clerkUserId = existing[0]?.clerkUserId || '';
    }

    if (clerkUserId && customerId) {
      await syncSubscriptionByObject(sub, customerId, clerkUserId);
    }
  }

  return NextResponse.json({ received: true });
}
