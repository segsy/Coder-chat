'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createTenantPortal, connectTenantDomain, updateTenantTheme, curateTenantListing } from '@/actions/tenant-admin';
import { useEffect, useState } from 'react';

function SubmitButton({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'outline' | 'secondary'; className?: string }) {
  const { pending } = useFormStatus();
  
  const variantClasses = {
    default: 'bg-black text-white hover:opacity-90',
    outline: 'border bg-background hover:bg-muted',
    secondary: 'bg-blue-600 text-white hover:opacity-90'
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {pending ? 'Loading...' : children}
    </button>
  );
}

function CreatePortalForm() {
  const [state, formAction] = useFormState(createTenantPortal, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <section className="rounded-2xl border bg-white/70 p-6">
      <h2 className="text-lg font-semibold">Create Portal</h2>
      {state?.error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}
      {showSuccess && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-600">Portal created successfully!</div>
      )}
      <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-3">
        <input 
          name="name" 
          placeholder="Portal name" 
          required
          className="rounded-lg border px-3 py-2 text-sm" 
        />
        <input 
          name="slug" 
          placeholder="slug (optional)" 
          className="rounded-lg border px-3 py-2 text-sm" 
        />
        <SubmitButton>Create Portal</SubmitButton>
      </form>
    </section>
  );
}

function DomainForm({ tenantId, customDomain }: { tenantId: string; customDomain: string | null }) {
  const [state, formAction] = useFormState(connectTenantDomain, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 flex flex-wrap gap-3">
      <input type="hidden" name="tenantId" value={tenantId} />
      <input 
        name="customDomain" 
        defaultValue={customDomain || ''} 
        placeholder="academy.example.com" 
        className="rounded-lg border px-3 py-2 text-sm" 
      />
      {state?.error && (
        <div className="w-full rounded-lg bg-red-50 p-2 text-sm text-red-600">{state.error}</div>
      )}
      {showSuccess && (
        <div className="w-full rounded-lg bg-green-50 p-2 text-sm text-green-600">Domain saved successfully!</div>
      )}
      <SubmitButton variant="outline">Save Domain</SubmitButton>
    </form>
  );
}

function ThemeForm({ tenantId, theme }: { tenantId: string; theme: { brand?: string; background?: string; foreground?: string } }) {
  const [state, formAction] = useFormState(updateTenantTheme, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-4">
      <input type="hidden" name="tenantId" value={tenantId} />
      <input 
        name="brand" 
        defaultValue={String(theme?.brand || '#2563eb')} 
        placeholder="#2563eb" 
        className="rounded-lg border px-3 py-2 text-sm" 
      />
      <input 
        name="background" 
        defaultValue={String(theme?.background || '#ffffff')} 
        placeholder="#ffffff" 
        className="rounded-lg border px-3 py-2 text-sm" 
      />
      <input 
        name="foreground" 
        defaultValue={String(theme?.foreground || '#111827')} 
        placeholder="#111827" 
        className="rounded-lg border px-3 py-2 text-sm" 
      />
      {state?.error && (
        <div className="col-span-full rounded-lg bg-red-50 p-2 text-sm text-red-600">{state.error}</div>
      )}
      {showSuccess && (
        <div className="col-span-full rounded-lg bg-green-50 p-2 text-sm text-green-600">Theme saved successfully!</div>
      )}
      <SubmitButton variant="secondary" className="md:col-start-4">Save Theme</SubmitButton>
    </form>
  );
}

function ListingItem({ listing, isPublished, tenantId }: { 
  listing: { id: string; title: string; slug: string }; 
  isPublished: boolean; 
  tenantId: string 
}) {
  const [state, formAction] = useFormState(curateTenantListing, null);
  const [localPublished, setLocalPublished] = useState(isPublished);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setLocalPublished(!localPublished);
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    if (state?.error) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <li className="rounded-lg border p-3">
      {state?.error && (
        <div className="mb-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">{state.error}</div>
      )}
      {showSuccess && !state?.error && (
        <div className="mb-2 rounded-lg bg-green-50 p-2 text-sm text-green-600">
          {state?.success ? (localPublished ? 'Removed from portal' : 'Added to portal') : 'Updated'}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{listing.title}</p>
          <p className="text-xs text-slate-500">/{listing.slug}</p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="publish" value={localPublished ? 'false' : 'true'} />
          <SubmitButton variant="outline">
            {localPublished ? 'Remove' : 'Add'}
          </SubmitButton>
        </form>
      </div>
    </li>
  );
}

export { CreatePortalForm, DomainForm, ThemeForm, ListingItem };
