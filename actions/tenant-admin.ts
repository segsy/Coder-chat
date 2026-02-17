'use server';

import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { courseListings, tenantListings, tenants } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createTenantPortal(formData: FormData) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');

  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const name = String(formData.get('name') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  if (!name) throw new Error('Tenant name is required.');

  const slug = slugify(slugInput || name) || `tenant-${randomUUID().slice(0, 6)}`;

  await db.insert(tenants).values({
    ownerClerkUserId: user.id,
    name,
    slug,
    themeJson: {
      brand: '#2563eb',
      background: '#ffffff',
      foreground: '#111827'
    }
  });

  revalidatePath('/tenant-admin');
}

export async function connectTenantDomain(formData: FormData) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = String(formData.get('tenantId') || '');
  const customDomain = String(formData.get('customDomain') || '').trim().toLowerCase();

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) throw new Error('Tenant not found.');

  await db.update(tenants).set({ customDomain: customDomain || null }).where(eq(tenants.id, tenant.id));
  revalidatePath('/tenant-admin');
}

export async function updateTenantTheme(formData: FormData) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = String(formData.get('tenantId') || '');
  const brand = String(formData.get('brand') || '#2563eb');
  const background = String(formData.get('background') || '#ffffff');
  const foreground = String(formData.get('foreground') || '#111827');

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) throw new Error('Tenant not found.');

  await db.update(tenants).set({ themeJson: { brand, background, foreground } }).where(eq(tenants.id, tenant.id));
  revalidatePath('/tenant-admin');
}

export async function curateTenantListing(formData: FormData) {
  if (!canUseDb) throw new Error('DATABASE_URL is not configured.');
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const tenantId = String(formData.get('tenantId') || '');
  const listingId = String(formData.get('listingId') || '');
  const publish = String(formData.get('publish') || 'true') === 'true';

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) throw new Error('Tenant not found.');

  const [listing] = await db.select().from(courseListings).where(eq(courseListings.id, listingId)).limit(1);
  if (!listing) throw new Error('Listing not found.');

  const existing = await db
    .select()
    .from(tenantListings)
    .where(and(eq(tenantListings.tenantId, tenant.id), eq(tenantListings.listingId, listing.id)))
    .limit(1);

  if (!existing[0]) {
    await db.insert(tenantListings).values({ tenantId: tenant.id, listingId: listing.id, published: publish });
  } else {
    await db.update(tenantListings).set({ published: publish }).where(eq(tenantListings.id, existing[0].id));
  }

  revalidatePath('/tenant-admin');
}
