import { MessageSquare } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';

const enterpriseFeatures = [
  {
    title: 'Role-based permissions',
    body: 'From shared access to real-time edits, your team can stay in sync with secure project visibility controls.'
  },
  {
    title: 'Streamlined integrations',
    body: 'Connect your existing tools and workflows so your engineering, design, and product teams move together.'
  },
  {
    title: 'Team-level admin controls',
    body: 'Manage collaborators, environments, billing, and policy enforcement in one unified enterprise console.'
  }
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#060b14] text-white">
      <SiteHeader />

      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(35,110,180,0.35),rgba(6,11,20,0.96)_60%)] px-6 pb-14 pt-20 text-center">
        <h1 className="text-6xl font-bold leading-tight text-[#7067ff] md:text-7xl">Generate, tweak, repeat</h1>
        <p className="mt-5 text-5xl font-semibold md:text-6xl">10x faster with AI.</p>
        <p className="mx-auto mt-5 max-w-3xl text-3xl text-zinc-400 md:text-4xl">
          Join leading companies transforming their development workflow.
        </p>

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-700/35 to-slate-900/35 p-6 md:p-8">
          <div className="mx-auto grid size-28 place-items-center rounded-full bg-black/80">
            <MessageSquare className="size-12 text-blue-500" />
          </div>
          <h2 className="mt-6 text-6xl font-semibold">Get in touch</h2>
          <p className="mx-auto mt-4 max-w-2xl text-3xl text-zinc-400">
            Unlock the full potential of Bolt with help from our team.
          </p>
          <div className="mx-auto mt-6 max-w-3xl space-y-4">
            <input
              type="email"
              placeholder="Your work email"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 text-3xl text-zinc-200 outline-none ring-blue-500 focus:ring"
            />
            <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-3xl font-medium">Book your demo</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 text-center">
        <p className="text-2xl font-medium tracking-[0.15em] text-zinc-400">TRUSTED BY COMPANIES YOU KNOW AND LOVE</p>
        <div className="mt-8 grid grid-cols-2 gap-4 text-5xl font-semibold text-zinc-300 md:grid-cols-4">
          <span>shopify</span>
          <span>NBC</span>
          <span>Google</span>
          <span>Meta</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h3 className="text-center text-6xl font-bold md:text-7xl">Everything you need to succeed</h3>
        <p className="mx-auto mt-4 max-w-3xl text-center text-3xl text-zinc-400 md:text-4xl">
          We&apos;ve thought of everything so you can focus on your vision while we handle the rest.
        </p>

        <div className="mt-8 grid gap-6">
          {enterpriseFeatures.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8">
              <h4 className="text-5xl font-semibold">{feature.title}</h4>
              <p className="mt-4 text-3xl text-zinc-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
