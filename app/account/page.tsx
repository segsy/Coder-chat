import { SiteHeader } from '@/components/marketing/site-header';

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="mt-2 text-slate-600">Manage profile, plan, and authentication providers.</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Authentication</h2>
          <p className="mt-2 text-sm text-slate-600">Clerk OAuth providers are supported: Email, Google, and GitHub.</p>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <p className="mt-2 text-sm text-slate-600">Current plan: Free. Upgrade on pricing page to unlock unlimited generation.</p>
        </div>
      </section>
    </main>
  );
}
