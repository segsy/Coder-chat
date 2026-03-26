import { Bell, BookOpenText, Building2, CreditCard, KeyRound, Menu, MoreVertical, Search, Users, UserRound } from 'lucide-react';

const docCards = [
  {
    title: 'QuickStart guide',
    body: 'Get started with Nexus by building, editing, and publishing your first app in just a few minutes.',
    icon: BookOpenText
  },
  {
    title: 'Nexus Cloud',
    body: 'Nexus Cloud gives you domains, hosting, and databases in one place with no third-party tools required.',
    icon: Building2
  },
  {
    title: 'Best practices',
    body: 'Learn how to optimize prompts, use tokens wisely, and get more value from discussion mode.',
    icon: Bell
  },
  {
    title: 'Getting started with Nexus',
    body: 'Need the basics? This quick introduction explains what Nexus does and who it is for.',
    icon: Users
  }
];

const accountCards = [
  { title: 'Billing', body: 'Billing and subscription management.', icon: CreditCard },
  { title: 'Tokens', body: 'Buying tokens and token usage questions.', icon: KeyRound },
  { title: 'Accounts', body: 'Manage your Nexus and StackBlitz account.', icon: UserRound },
  { title: 'Teams plans', body: 'Create and manage Teams plans.', icon: Users },
  { title: 'Corporate', body: 'Learn about Nexus for commercial use.', icon: Building2 }
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-[#050a12] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060b13]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
          <div className="text-6xl font-black italic">nexus</div>
          <div className="flex items-center gap-6 text-zinc-300">
            <Search className="size-8" />
            <MoreVertical className="size-8" />
          </div>
        </div>

        <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 border-t border-white/10 px-6 text-2xl font-medium text-zinc-200 md:text-4xl">
          <Menu className="size-8" />
          <span>Nexus Help Center: Docs, FAQs, and tutorials</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="max-w-4xl text-6xl font-bold leading-tight md:text-7xl">Nexus Help Center: Docs, FAQs, and tutorials</h1>
        <p className="mt-5 max-w-4xl text-3xl leading-relaxed text-zinc-400 md:text-4xl">
          Need help with ore tutorials, FAQs, and support docs to quickly learn how to create websites and apps with    </p>

        <div className="mt-8 rounded-3xl border border-blue-500/50 bg-blue-950/40 p-6 text-3xl text-blue-200 md:text-4xl">
          <p>
            February 3, 2026 — Nexus now gives you the option of using Anthropic&apos;s newest, most powerful model to date, Opus 4.6.
            Learn more about this update and other improvements in the <span className="underline">Release Notes</span>.
          </p>
        </div>

        <article className="mt-8 rounded-3xl border border-white/10 bg-[#040a13] p-8">
          <div className="flex items-start gap-5">
            <BookOpenText className="mt-1 size-8 text-blue-500" />
            <div>
              <h2 className="text-5xl font-semibold">Release Notes</h2>
              <p className="mt-3 text-3xl text-zinc-400 md:text-4xl">
                Explore the latest feature releases and platform updates from Nexus, along with helpful links to documentation and media.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-2">
        <h2 className="text-6xl font-bold md:text-7xl">Popular docs</h2>
        <p className="mt-4 max-w-5xl text-3xl text-zinc-400 md:text-4xl">
          Explore our top resources for helping you unlock Nexus&apos;s full potential and solve common issues.
        </p>

        <div className="mt-8 grid gap-5">
          {docCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-3xl border border-white/10 bg-[#040a13] p-8">
                <div className="flex items-start gap-5">
                  <Icon className="mt-1 size-8 text-blue-500" />
                  <div>
                    <h3 className="text-5xl font-semibold">{card.title}</h3>
                    <p className="mt-3 text-3xl text-zinc-400 md:text-4xl">{card.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-6xl font-bold md:text-7xl">Accounts and subscriptions</h2>
        <p className="mt-4 max-w-5xl text-3xl text-zinc-400 md:text-4xl">
          Have a question about your account, billing, or buying and using tokens? See the following support articles:
        </p>

        <div className="mt-8 grid gap-5">
          {accountCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-3xl border border-white/10 bg-[#040a13] p-8">
                <div className="flex items-start gap-5">
                  <Icon className="mt-1 size-8 text-blue-500" />
                  <div>
                    <h3 className="text-5xl font-semibold">{card.title}</h3>
                    <p className="mt-3 text-3xl text-zinc-400 md:text-4xl">{card.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-6xl font-bold md:text-7xl">Still have questions?</h2>
        <p className="mt-4 text-3xl leading-relaxed text-zinc-400 md:text-4xl">
          We know unexpected issues can be frustrating. The best way to get help is often from the Nexus Discord community.
          If that doesn&apos;t resolve it, email us at <span className="underline">support@Nexus.new</span>.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 p-8">
          <p className="text-3xl text-zinc-400 md:text-4xl">Was this page helpful?</p>
          <div className="mt-5 flex gap-4">
            <button className="rounded-2xl border border-white/15 px-8 py-3 text-3xl">👍 Yes</button>
            <button className="rounded-2xl border border-white/15 px-8 py-3 text-3xl">👎 No</button>
          </div>
        </div>
      </section>
    </main>
  );
}
