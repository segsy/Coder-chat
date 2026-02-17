import { Check } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';
import { createCheckoutAction } from '@/actions/create-checkout';

const freeFeatures = ['1 course total', 'Up to 5 lessons', 'Text scripts only', 'Watermarked preview'];
const proFeatures = ['Unlimited courses', 'Full script + narration output', 'Export and publish workflow', 'Priority AI queue', 'Stripe subscription checkout'];

function PricingCard({
  title,
  price,
  description,
  features,
  action,
  highlighted = false,
  isPro = false
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  action: string;
  highlighted?: boolean;
  isPro?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-6 ${highlighted ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-4xl font-bold">{price}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {features.map((feature) => (
          <li className="flex gap-2" key={feature}>
            <Check className="mt-0.5 size-4 text-green-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {isPro ? (
        <form action={createCheckoutAction} className="mt-6">
          <button type="submit" className="inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
            {action}
          </button>
        </form>
      ) : (
        <a href="/dashboard" className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white">
          {action}
        </a>
      )}
    </article>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Start free, then unlock unlimited educational course generation with Pro.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <PricingCard
            title="Free"
            price="$0/month"
            description="Best for validating prompts and testing structure."
            features={freeFeatures}
            action="Start Free"
          />
          <PricingCard
            title="Pro"
            price="$29/month"
            description="Built for creators shipping educational video products."
            features={proFeatures}
            action="Upgrade to Pro"
            highlighted
            isPro
          />
        </div>
      </section>
    </main>
  );
}
