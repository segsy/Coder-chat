import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { courseListings, courses } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export default async function MarketplacePage() {
  if (!canUseDb) {
    return <main className="min-h-screen p-10">Marketplace unavailable (no database).</main>;
  }

  const listings = await db
    .select({
      id: courseListings.id,
      slug: courseListings.slug,
      priceCents: courseListings.priceCents,
      title: courses.title,
      description: courses.description
    })
    .from(courseListings)
    .leftJoin(courses, eq(courses.id, courseListings.courseId))
    .where(and(eq(courseListings.published, true)))
    .orderBy(desc(courseListings.createdAt));

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">Marketplace</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded-xl border p-4">
            <h2 className="font-semibold">{listing.title || 'Untitled course'}</h2>
            <p className="mt-1 text-sm text-slate-600">{listing.description || 'No description'}</p>
            <p className="mt-3 text-sm font-medium">${(listing.priceCents / 100).toFixed(2)}</p>
            <Link className="mt-3 inline-block text-sm underline" href={`/marketplace/${listing.slug}`}>
              View listing
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
