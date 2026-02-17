import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiUsage, users } from '@/lib/db/schema';

const FREE_MONTHLY_TOKEN_LIMIT = 10_000;

const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export async function assertWithinUsageLimit(clerkUserId: string) {
  const userRows = await db.select({ plan: users.plan }).from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  const plan = userRows[0]?.plan ?? 'free';

  if (plan !== 'free') return;

  const monthStart = getMonthStart();
  const usage = await db
    .select({ value: sql<number>`coalesce(sum(${aiUsage.tokens}), 0)::int` })
    .from(aiUsage)
    .where(and(eq(aiUsage.clerkUserId, clerkUserId), gte(aiUsage.createdAt, monthStart)));

  const monthlyTokens = usage[0]?.value ?? 0;
  if (monthlyTokens >= FREE_MONTHLY_TOKEN_LIMIT) {
    throw new Error('Monthly AI limit exceeded. Upgrade to Pro for higher limits.');
  }
}

export function tokensToCents(tokens: number) {
  return Math.max(1, Math.ceil(tokens * 0.01));
}

export async function recordUsage(clerkUserId: string, jobId: string, tokens: number) {
  const costCents = tokensToCents(tokens);
  await db.insert(aiUsage).values({
    clerkUserId,
    jobId,
    tokens,
    costCents
  });

  return { tokens, costCents };
}
