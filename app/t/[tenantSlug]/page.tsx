import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

export default async function TenantLandingPage({ params }: { params: { tenantSlug: string } }) {
  if (!canUseDb) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-2xl font-bold">Tenant Portal</h1>
        <p className="mt-2 text-sm text-slate-600">Database is not configured.</p>
      </main>
    );
  }

  const rows = await db.select().from(tenants).where(eq(tenants.slug, params.tenantSlug)).limit(1);
  const tenant = rows[0];

  return (
    <main className="min-h-screen p-10" style={{ background: tenant?.themeJson?.background || '#ffffff', color: tenant?.themeJson?.foreground || '#111827' }}>
      <h1 className="text-3xl font-bold">{tenant?.name || params.tenantSlug}</h1>
      <p className="mt-2 text-sm">White-label creator portal.</p>
    </main>
  );
}
