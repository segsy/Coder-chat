import { and, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { courseListings, tenantCourses, tenants } from '@/lib/db/schema';
import { CreatePortalForm, DomainForm, ThemeForm, ListingItem } from '@/components/tenant-admin/forms';

const canUseDb = Boolean(process.env.DATABASE_URL);

export default async function TenantAdminPage() {
  const user = await currentUser();
  if (!user) return null;

  if (!canUseDb) {
    return <main className="min-h-screen p-10">Database is not configured.</main>;
  }

  const [myTenants, myListings] = await Promise.all([
    db.select().from(tenants).where(eq(tenants.ownerClerkUserId, user.id)),
    db.select().from(courseListings).where(eq(courseListings.creatorClerkUserId, user.id))
  ]);

  const selectedTenant = myTenants[0] || null;
  const curated = selectedTenant
    ? await db.select().from(tenantCourses).where(and(eq(tenantCourses.tenantId, selectedTenant.id), eq(tenantCourses.published, true)))
    : [];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold">Tenant Admin</h1>

        <CreatePortalForm />

        {selectedTenant ? (
          <>
            <section className="rounded-2xl border bg-white/70 p-6">
              <h2 className="text-lg font-semibold">Domain + Theme ({selectedTenant.name})</h2>

              <DomainForm tenantId={selectedTenant.id} customDomain={selectedTenant.customDomain} />

              <ThemeForm tenantId={selectedTenant.id} theme={selectedTenant.themeJson as { brand?: string; background?: string; foreground?: string } | undefined} />
            </section>

            <section className="rounded-2xl border bg-white/70 p-6">
              <h2 className="text-lg font-semibold">Curate Listings</h2>
              {myListings.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No listings yet. Publish a marketplace listing first.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {myListings.map((listing) => {
                    const isPublished = curated.some((item) => item.listingId === listing.id);
                    return (
                      <ListingItem
                        key={listing.id}
                        listing={listing}
                        isPublished={isPublished}
                        tenantId={selectedTenant.id}
                      />
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
