import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiUsage, subscriptions } from '@/lib/db/schema';
import { stripe } from '@/lib/stripe';
import { tokensToCents } from '@/lib/ai/usage';

export async function recordUsageAndReportToStripe(params: {
  clerkUserId: string;
  jobId: string;
  tokens: number;
}) {
  const costCents = tokensToCents(params.tokens);

  await db.insert(aiUsage).values({
    clerkUserId: params.clerkUserId,
    jobId: params.jobId,
    tokens: params.tokens,
    costCents
  });

  const rows = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, params.clerkUserId)).limit(1);
  const sub = rows[0];

  const isBillable = sub?.status === 'active' || sub?.status === 'trialing';
  if (!sub?.meteredSubscriptionItemId || !isBillable) {
    return { costCents };
  }

  await stripe.subscriptionItems.createUsageRecord(sub.meteredSubscriptionItemId, {
    quantity: Math.max(params.tokens, 1),
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  });

  return { costCents };
}
