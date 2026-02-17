import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

export async function getPlan(clerkUserId: string) {
  const row = await db.select().from(subscriptions).where(eq(subscriptions.clerkUserId, clerkUserId)).limit(1);
  const sub = row[0];

  const isPro = sub?.status === 'active' || sub?.status === 'trialing';

  return {
    isPro,
    status: sub?.status ?? 'inactive'
  };
}
