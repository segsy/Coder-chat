import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,120,195,0.3),rgba(17,19,27,0.96)_60%)] px-6 py-16 text-center">
        <h1 className="text-7xl font-bold md:text-8xl">Resources</h1>
        <p className="mx-auto mt-4 max-w-4xl text-3xl text-zinc-400 md:text-4xl">Guides, product updates, templates, and support docs.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
        <Link className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8 hover:bg-zinc-900" href="/blog">
          <h2 className="text-5xl font-semibold">Blog</h2>
          <p className="mt-3 text-3xl text-zinc-300">Release notes, tutorials, and growth stories from the community.</p>
        </Link>
        <Link className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8 hover:bg-zinc-900" href="/documentation">
          <h2 className="text-5xl font-semibold">Documentation</h2>
          <p className="mt-3 text-3xl text-zinc-300">API references, integration guides, and onboarding instructions.</p>
        </Link>
      </section>
    </main>
  );
}
