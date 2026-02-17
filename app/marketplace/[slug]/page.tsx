import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { courseListings, courses } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export default async function MarketplaceListingPage({ params }: { params: { slug: string } }) {
  if (!canUseDb) {
    return <main className="min-h-screen p-10">Marketplace unavailable (no database).</main>;
  }

  const rows = await db
    .select({
      id: courseListings.id,
      priceCents: courseListings.priceCents,
      title: courses.title,
      description: courses.description,
      prompt: courses.prompt
    })
    .from(courseListings)
    .leftJoin(courses, eq(courses.id, courseListings.courseId))
    .where(eq(courseListings.slug, params.slug))
    .limit(1);

  const listing = rows[0];
  if (!listing) {
    return <main className="min-h-screen p-10">Listing not found.</main>;
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">{listing.title || 'Untitled course'}</h1>
      <p className="mt-2 text-slate-600">{listing.description || 'No description provided.'}</p>
      <p className="mt-3 text-lg font-semibold">${(listing.priceCents / 100).toFixed(2)}</p>
      <button className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">Purchase (Stripe checkout next)</button>
      <pre className="mt-6 whitespace-pre-wrap rounded bg-slate-50 p-4 text-xs text-slate-500">{listing.prompt}</pre>
    </main>
  );
}
