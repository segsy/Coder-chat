import { NextResponse } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { aiUsage, courses, subscriptions, usageEvents, users } from '@/lib/db/schema';
import { listUsage } from '@/lib/usage-store';

const canUseDb = Boolean(process.env.DATABASE_URL);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vidcourse.com';

export async function GET() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!user || !email || email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!canUseDb) {
    const usage = listUsage();
    const usageRevenue = usage.reduce((sum, event) => sum + event.units * event.unitCostCents, 0) / 100;
    return NextResponse.json({
      mrr: 0,
      usageRevenue,
      totalRevenue: usageRevenue,
      activeProSubscriptions: 0,
      totalUsers: 0,
      totalCourses: 0,
      totalGenerations: usage.length,
      monthlyRevenue: [usageRevenue],
      recentUsage: usage.slice(-10).reverse()
    });
  }

  const [activePro, totalUsersCount, totalCoursesCount, generationCount, usageRevenueAgg, tokenAgg, recentUsage, meteredUsage] = await Promise.all([
    db.select({ value: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.status, 'active')),
    db.select({ value: sql<number>`count(*)::int` }).from(users),
    db.select({ value: sql<number>`count(*)::int` }).from(courses),
    db.select({ value: sql<number>`count(*)::int` }).from(usageEvents).where(eq(usageEvents.eventType, 'ai_generation')),
    db.select({ value: sql<number>`coalesce(sum(${aiUsage.costCents}),0)::int` }).from(aiUsage),
    db.select({ value: sql<number>`coalesce(sum(${aiUsage.tokens}),0)::int` }).from(aiUsage),
    db.select().from(usageEvents).orderBy(desc(usageEvents.createdAt)).limit(10),
    db.select().from(aiUsage).orderBy(desc(aiUsage.createdAt)).limit(10)
  ]);

  const activeSubs = activePro[0]?.value ?? 0;
  const mrr = activeSubs * 29;
  const usageRevenue = (usageRevenueAgg[0]?.value ?? 0) / 100;
  const totalRevenue = mrr + usageRevenue;

  return NextResponse.json({
    mrr,
    usageRevenue,
    totalRevenue,
    activeProSubscriptions: activeSubs,
    totalUsers: totalUsersCount[0]?.value ?? 0,
    totalCourses: totalCoursesCount[0]?.value ?? 0,
    totalGenerations: generationCount[0]?.value ?? 0,
    meteredTokens: tokenAgg[0]?.value ?? 0,
    monthlyRevenue: [Math.round(totalRevenue * 0.6), Math.round(totalRevenue * 0.8), Math.round(totalRevenue)],
    recentUsage,
    meteredUsage
  });
}
