import { and, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { courseListings, tenantListings, tenants } from '@/lib/db/schema';
import { connectTenantDomain, createTenantPortal, curateTenantListing, updateTenantTheme } from '@/actions/tenant-admin';

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
    ? await db.select().from(tenantListings).where(and(eq(tenantListings.tenantId, selectedTenant.id), eq(tenantListings.published, true)))
    : [];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold">Tenant Admin</h1>

        <section className="rounded-2xl border bg-white/70 p-6">
          <h2 className="text-lg font-semibold">Create Portal</h2>
          <form action={createTenantPortal} className="mt-4 grid gap-3 md:grid-cols-3">
            <input name="name" placeholder="Portal name" className="rounded-lg border px-3 py-2 text-sm" />
            <input name="slug" placeholder="slug (optional)" className="rounded-lg border px-3 py-2 text-sm" />
            <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">Create Portal</button>
          </form>
        </section>

        {selectedTenant ? (
          <>
            <section className="rounded-2xl border bg-white/70 p-6">
              <h2 className="text-lg font-semibold">Domain + Theme ({selectedTenant.name})</h2>

              <form action={connectTenantDomain} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="tenantId" value={selectedTenant.id} />
                <input name="customDomain" defaultValue={selectedTenant.customDomain || ''} placeholder="academy.example.com" className="rounded-lg border px-3 py-2 text-sm" />
                <button className="rounded-lg border px-4 py-2 text-sm">Save Domain</button>
              </form>

              <form action={updateTenantTheme} className="mt-4 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="tenantId" value={selectedTenant.id} />
                <input name="brand" defaultValue={String(selectedTenant.themeJson?.brand || '#2563eb')} placeholder="#2563eb" className="rounded-lg border px-3 py-2 text-sm" />
                <input name="background" defaultValue={String(selectedTenant.themeJson?.background || '#ffffff')} placeholder="#ffffff" className="rounded-lg border px-3 py-2 text-sm" />
                <input name="foreground" defaultValue={String(selectedTenant.themeJson?.foreground || '#111827')} placeholder="#111827" className="rounded-lg border px-3 py-2 text-sm" />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Save Theme</button>
              </form>
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
                      <li key={listing.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-xs text-slate-500">/{listing.slug}</p>
                          </div>
                          <form action={curateTenantListing}>
                            <input type="hidden" name="tenantId" value={selectedTenant.id} />
                            <input type="hidden" name="listingId" value={listing.id} />
                            <input type="hidden" name="publish" value={isPublished ? 'false' : 'true'} />
                            <button className="rounded-lg border px-3 py-2 text-xs">{isPublished ? 'Remove' : 'Add'}</button>
                          </form>
                        </div>
                      </li>
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
