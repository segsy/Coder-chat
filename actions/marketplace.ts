'use server';

import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { courseListings, courses, purchases } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export async function publishCourseToMarketplace(input: { courseId: string; priceCents: number; slug?: string }) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, input.courseId), eq(courses.clerkUserId, user.id)))
    .limit(1);

  if (!course) {
    throw new Error('Course not found.');
  }

  const slug = input.slug || `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomUUID().slice(0, 6)}`;

  await db.insert(courseListings).values({
    courseId: course.id,
    creatorClerkUserId: user.id,
    priceCents: Math.max(0, input.priceCents),
    slug,
    published: true
  });

  return { ok: true, slug };
}

export async function recordMarketplacePurchase(input: { listingId: string; stripePaymentIntentId?: string }) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  await db.insert(purchases).values({
    listingId: input.listingId,
    buyerClerkUserId: user.id,
    stripePaymentIntentId: input.stripePaymentIntentId || null
  });

  return { ok: true };
}
