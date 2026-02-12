import { Menu, Disc3, Linkedin, Twitter, Reddit, Github, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { UnsubscribeSurvey } from '@/components/marketing/unsubscribe-survey';

const trustedBy = ['accenture', 'Google', 'intel', 'Meta', 'salesforce', 'shopify', 'stripe'];

const featureCards = [
  {
    title: '98% less errors',
    description: 'Bolt automatically tests, refactors, and iterates so you keep building instead of fixing.',
    accent: 'from-white/10 via-blue-500/10 to-transparent'
  },
  {
    title: 'Build big without breaking',
    description: "Handles projects 1,000x larger with improved context management for complex codebases.",
    accent: 'from-blue-500/20 via-indigo-500/5 to-transparent'
  },
  {
    title: 'Build with design system',
    description: 'Stop building from scratch. Start building on-brand with reusable primitives.',
    accent: 'from-lime-500/20 via-blue-500/10 to-transparent'
  }
];

const roleCards = [
  ['Product managers', 'Go from insight to prototype in hours and test ideas with your team before the day is over.'],
  ['Entrepreneurs', 'Launch a full business in days, not months. From landing page to product, all in one flow.'],
  ['Marketers', 'Spin up high-performing campaign pages in hours, with SEO and hosting built in.'],
  ['Agencies', 'Multiply your impact: deliver more projects, faster, without scaling headcount.'],
  ['Students & builders', 'Learn by doing. Turn ideas from class or side projects into fully working apps.']
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070a13] text-white">
      <section className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e18]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <div className="text-4xl font-black tracking-tight italic">bolt<span className="text-lg align-top not-italic">.new</span></div>
          <div className="flex items-center gap-5 text-zinc-300">
            <Disc3 className="size-6" />
            <Linkedin className="size-6" />
            <Twitter className="size-6" />
            <Reddit className="size-6" />
            <Menu className="size-6" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 px-6 pb-16 pt-14 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.45),rgba(7,10,19,0.9)_60%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-blue-200/20 bg-white/10 px-6 py-3 text-lg text-zinc-200">
            <Sparkles className="size-5" /> Introducing Bolt V2
          </div>
          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
            What will you <span className="bg-gradient-to-b from-sky-200 to-blue-500 bg-clip-text italic text-transparent">build</span> today?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-2xl text-zinc-400">Create stunning apps & websites by chatting with AI.</p>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-zinc-800/70 p-4 shadow-2xl shadow-blue-500/10">
            <div className="rounded-2xl border border-white/10 p-6 text-left text-zinc-400">Let&apos;s build an enterprise solution that..</div>
            <div className="mt-4 flex items-center justify-between px-2">
              <button className="grid size-12 place-items-center rounded-full bg-white/10 text-zinc-300"><Plus /></button>
              <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-lg font-medium">Generate <ArrowRight className="size-5" /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-zinc-500">THE #1 PROFESSIONAL VIBE CODING TOOL TRUSTED BY</p>
        <div className="mt-10 grid grid-cols-2 gap-y-8 text-5xl font-semibold text-zinc-300 md:grid-cols-4">
          {trustedBy.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <div className="mx-auto h-20 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent" />
        <h2 className="mx-auto mt-5 max-w-3xl text-5xl font-bold leading-tight text-zinc-200 md:text-6xl">
          Empowering product builders with the most powerful coding agents
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-2xl text-zinc-400">Bolt does the heavy lifting for you, so you can focus on vision instead of fighting errors.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
        {featureCards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8">
            <div className={`mb-8 h-32 rounded-2xl bg-gradient-to-r ${card.accent}`} />
            <h3 className="text-4xl font-bold">{card.title}</h3>
            <p className="mt-4 text-xl text-zinc-400">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-5xl font-bold text-zinc-200 md:text-6xl">Whatever your role, Bolt gives you superpowers</h2>
        <p className="mx-auto mt-5 max-w-4xl text-2xl text-zinc-400">From idea to live product, Bolt adapts to how you work turning every vision into something real & fast.</p>

        <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
          {roleCards.map(([title, desc]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8">
              <h3 className="text-4xl font-semibold text-zinc-100">{title}</h3>
              <p className="mt-3 text-xl leading-relaxed text-zinc-400">{desc}</p>
              <div className="mt-6 h-40 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-transparent" />
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 px-6 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,.6),rgba(7,10,19,0.95)_55%)]" />
        <div className="relative mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold md:text-6xl">Ready to build something amazing?</h2>
          <p className="mt-5 text-2xl text-zinc-400">Try it out and start building for free.</p>
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-white/10 bg-zinc-800/70 p-4">
            <div className="rounded-2xl border border-white/10 p-6 text-left text-zinc-400">Let&apos;s build a customer portal with analytics dashboard...</div>
            <div className="mt-4 flex justify-end">
              <button className="rounded-full bg-blue-600 px-8 py-3 text-lg font-medium">Get started</button>
            </div>
          </div>
        </div>
      </section>

      <UnsubscribeSurvey />

      <footer className="mx-auto grid max-w-6xl gap-10 px-6 py-16 text-zinc-400 md:grid-cols-3">
        <div>
          <p className="text-6xl font-black italic text-white">bolt</p>
        </div>
        <div>
          <h4 className="mb-4 text-3xl text-white">Resources</h4>
          <ul className="space-y-3 text-2xl">
            <li>Pricing</li><li>Support</li><li>Blog</li><li>Status</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-3xl text-white">Social</h4>
          <ul className="space-y-3 text-2xl">
            <li className="inline-flex items-center gap-2"><Disc3 className="size-5" />Discord</li>
            <li className="inline-flex items-center gap-2"><Linkedin className="size-5" />LinkedIn</li>
            <li className="inline-flex items-center gap-2"><Twitter className="size-5" />Twitter/X</li>
            <li className="inline-flex items-center gap-2"><Reddit className="size-5" />Reddit</li>
            <li className="inline-flex items-center gap-2"><Github className="size-5" />GitHub</li>
          </ul>
        </div>
        <p className="md:col-span-3 text-center text-xl text-zinc-500">© 2026 StackBlitz - All rights reserved.</p>
      </footer>
    </main>
  );
}
