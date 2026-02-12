import { Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';

const freeFeatures = [
  'Public and private projects',
  '300K tokens daily limit',
  '1M tokens per month',
  'Bolt branding on websites',
  '10MB file upload limit',
  'Website hosting',
  'Up to 333k web requests',
  'Unlimited databases'
];

const proFeatures = [
  'Public and private projects',
  'No daily token limit',
  'Start at 10M tokens per month',
  'No bolt branding on websites',
  'Share sites privately',
  '100MB file upload limit',
  'Website hosting',
  'Up to 1M web requests',
  'Unused tokens roll over',
  'Custom domain support',
  'SEO boosting',
  'Unlimited databases'
];

const teamFeatures = [
  'Centralized billing',
  'Team-level access management',
  'Granular admin controls',
  'Share with your organization',
  'Private NPM registries support',
  'Design system prompts per package',
  'Unused tokens roll over to next month'
];

const enterpriseFeatures = [
  'Advanced security, SSO, and audit logs',
  'Granular admin controls & provisioning',
  'Dedicated account manager & 24/7 support',
  'Custom workflows, integrations & SLAs',
  'Scalable for high-volume usage',
  'Flexible billing and procurement',
  'Data governance & retention policies'
];

const faqs = [
  ['What are tokens?', 'AI tokens measure model usage. Larger projects and context use more tokens per message.'],
  ['How do Teams plans work?', 'Teams plans are billed per team member, each with monthly token allotments.'],
  ['Do tokens rollover from month to month?', 'Paid plan tokens roll over for one additional month with active subscription.'],
  ['Can I change my plan later?', 'Yes. Use billing portal to upgrade, downgrade, or switch plans.'],
  ['Can I cancel my subscription?', 'Yes, cancellation is available anytime from your billing settings.'],
  ['What are the token limits associated with a free plan?', 'Free includes 300,000 daily tokens and 1 million monthly tokens.']
];

function PriceCard({ title, price, subtitle, cta, features, popular = false }: { title: string; price: string; subtitle: string; cta: string; features: string[]; popular?: boolean }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-5xl font-semibold">{title}</h3>
        {popular ? <span className="rounded-full bg-white px-4 py-2 text-xl font-medium text-zinc-900">POPULAR</span> : null}
      </div>
      <div className="mb-6 flex items-end gap-3">
        <span className="text-8xl font-bold">{price}</span>
        <span className="pb-2 text-3xl text-zinc-300">{subtitle}</span>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-4xl">10M / month</div>
      <button className="mb-8 w-full rounded-2xl bg-blue-600 px-5 py-4 text-3xl font-medium text-white">{cta}</button>

      <h4 className="mb-4 text-4xl font-semibold">You get:</h4>
      <ul className="space-y-4 text-3xl text-zinc-300">
        {features.map((feature) => (
          <li className="flex items-start gap-3" key={feature}>
            <Check className="mt-1 size-6 text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,120,195,0.35),rgba(17,19,27,0.95)_60%)] px-6 py-16 text-center">
        <h1 className="text-8xl font-bold">Pricing</h1>
        <p className="mx-auto mt-5 max-w-3xl text-5xl text-zinc-400">Start for free. Upgrade as you go.</p>
        <div className="mx-auto mt-8 flex w-fit rounded-full border border-white/15 bg-black/30 p-1 text-4xl">
          <button className="rounded-full bg-blue-950/60 px-8 py-2 text-blue-400">Monthly</button>
          <button className="px-8 py-2 text-zinc-300">Yearly</button>
        </div>
        <p className="mt-6 text-4xl font-semibold">Save 10% on a yearly subscription</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10">
        <PriceCard title="Free" price="$0" subtitle="/ month" cta="Your current plan" features={freeFeatures} />
        <PriceCard title="Pro" price="$25" subtitle="per month billed monthly" cta="Upgrade" features={proFeatures} popular />
        <PriceCard title="Teams" price="$30" subtitle="per member billed monthly" cta="Create new team" features={teamFeatures} />

        <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8">
          <h3 className="text-5xl font-semibold">Enterprise</h3>
          <p className="mt-3 text-8xl font-bold">Custom</p>
          <p className="mt-5 text-4xl text-zinc-300">Advanced security, compliance, and 24/7 support tailored to your organization.</p>
          <button className="mt-6 w-full rounded-2xl bg-white/10 px-5 py-4 text-3xl">Ask for a quote</button>
          <h4 className="mb-4 mt-8 text-4xl font-semibold">You get everything in Pro, plus:</h4>
          <ul className="space-y-4 text-3xl text-zinc-300">
            {enterpriseFeatures.map((feature) => (
              <li className="flex items-start gap-3" key={feature}>
                <Check className="mt-1 size-6 text-emerald-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(45,120,195,0.25),rgba(17,19,27,0.98)_60%)] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-7xl font-bold">Frequently asked questions</h2>
          <p className="mt-4 text-4xl text-zinc-400">Everything you need to know about product and billing.</p>

          <div className="mt-8 space-y-5">
            {faqs.map(([question, answer]) => (
              <details key={question} className="rounded-3xl bg-white/5 p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-5xl font-medium">
                  {question}
                  <ChevronDown className="size-8" />
                </summary>
                <p className="mt-4 text-3xl text-zinc-400">{answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-blue-900/30 p-6 text-3xl">
            For additional information, please visit our <Link className="underline text-blue-400" href="#">Help Center</Link>.
          </div>
        </div>
      </section>
    </main>
  );
}
