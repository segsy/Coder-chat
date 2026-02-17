import { notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aiUsage, subscriptions } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vidcourse.com';

export default async function AdminDashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!user || !email || email !== ADMIN_EMAIL) {
    notFound();
  }

  if (!canUseDb) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-sm text-slate-600">DATABASE_URL is not configured.</p>
      </main>
    );
  }

  const [usageRevenueAgg, usageTokensAgg, activeSubs] = await Promise.all([
    db.select({ value: sql<number>`coalesce(sum(${aiUsage.costCents}),0)::int` }).from(aiUsage),
    db.select({ value: sql<number>`coalesce(sum(${aiUsage.tokens}),0)::int` }).from(aiUsage),
    db.select({ value: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.status, 'active'))
  ]);

  const revenueCents = usageRevenueAgg[0]?.value ?? 0;
  const totalTokens = usageTokensAgg[0]?.value ?? 0;
  const activeSubscribers = activeSubs[0]?.value ?? 0;

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-slate-600">AI Revenue</p>
          <p className="text-2xl font-bold">${(revenueCents / 100).toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-slate-600">Active Subscribers</p>
          <p className="text-2xl font-bold">{activeSubscribers}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-slate-600">Metered Tokens</p>
          <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
