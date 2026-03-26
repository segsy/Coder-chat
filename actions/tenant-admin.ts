'use server';

import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { courseListings, tenantCourses, tenants } from '@/lib/db/schema';

const canUseDb = Boolean(process.env.DATABASE_URL);

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

type FormState = {
  success?: boolean;
  error?: string;
};

export async function createTenantPortal(state: FormState, formData: FormData): Promise<FormState> {
  if (!canUseDb) return { error: 'DATABASE_URL is not configured.' };

  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };

  const name = String(formData.get('name') || '').trim();
  const slugInput = String(formData.get('slug') || '').trim();
  if (!name) return { error: 'Tenant name is required.' };

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
  return { success: true };
}

export async function connectTenantDomain(state: FormState, formData: FormData): Promise<FormState> {
  if (!canUseDb) return { error: 'DATABASE_URL is not configured.' };
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };

  const tenantId = String(formData.get('tenantId') || '');
  const customDomain = String(formData.get('customDomain') || '').trim().toLowerCase();

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) return { error: 'Tenant not found.' };

  await db.update(tenants).set({ customDomain: customDomain || null }).where(eq(tenants.id, tenant.id));
  revalidatePath('/tenant-admin');
  return { success: true };
}

export async function updateTenantTheme(state: FormState, formData: FormData): Promise<FormState> {
  if (!canUseDb) return { error: 'DATABASE_URL is not configured.' };
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };

  const tenantId = String(formData.get('tenantId') || '');
  const brand = String(formData.get('brand') || '#2563eb');
  const background = String(formData.get('background') || '#ffffff');
  const foreground = String(formData.get('foreground') || '#111827');

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) return { error: 'Tenant not found.' };

  await db.update(tenants).set({ themeJson: { brand, background, foreground } }).where(eq(tenants.id, tenant.id));
  revalidatePath('/tenant-admin');
  return { success: true };
}

export async function curateTenantListing(state: FormState, formData: FormData): Promise<FormState> {
  if (!canUseDb) return { error: 'DATABASE_URL is not configured.' };
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };

  const tenantId = String(formData.get('tenantId') || '');
  const listingId = String(formData.get('listingId') || '');
  const publish = String(formData.get('publish') || 'true') === 'true';

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerClerkUserId, user.id)))
    .limit(1);

  if (!tenant) return { error: 'Tenant not found.' };

  const [listing] = await db.select().from(courseListings).where(eq(courseListings.id, listingId)).limit(1);
  if (!listing) return { error: 'Listing not found.' };

  const existing = await db
    .select()
    .from(tenantCourses)
    .where(and(eq(tenantCourses.tenantId, tenant.id), eq(tenantCourses.courseId, listing.id)))
    .limit(1);

  if (!existing[0]) {
    await db.insert(tenantCourses).values({ tenantId: tenant.id, courseId: listing.id, published: publish });
  } else {
    await db.update(tenantCourses).set({ published: publish }).where(eq(tenantCourses.id, existing[0].id));
  }

  revalidatePath('/tenant-admin');
  return { success: true };
}
