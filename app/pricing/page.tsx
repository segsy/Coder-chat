'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const freeFeatures = [
  '2 website generations per month',
  'Basic templates (Hero, Forms, Landing)',
  'Code export (HTML/CSS)',
  '720p image transformations',
  'Community support',
];

const proFeatures = [
  '50 website generations per month',
  'All templates + custom AI generation',
  'Export React/Tailwind code',
  'AI image transformations (4K)',
  'Priority support',
  'Custom domains',
  'No watermarks',
];

const enterpriseFeatures = [
  'Unlimited website generations',
  'Custom AI model training',
  'White-label solution',
  'Dedicated support',
  'SLA guarantee',
  'API access',
  'Team collaboration',
];

function PricingCard({
  title,
  price,
  description,
  features,
  action,
  highlighted = false,
  isEnterprise = false
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  action: string;
  highlighted?: boolean;
  isEnterprise?: boolean;
}) {
  return (
    <article className={`relative rounded-2xl p-8 ${
      highlighted 
        ? 'border-2 border-purple-500 bg-purple-500/10' 
        : isEnterprise
        ? 'border border-purple-500/30 bg-purple-500/5'
        : 'border border-white/10 bg-white/[0.02]'
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}
      
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        {price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li className="flex gap-3" key={feature}>
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button className={`mt-8 w-full rounded-xl py-3 font-medium transition-all ${
        highlighted
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
          : isEnterprise
          ? 'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
          : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
      }`}>
        {action}
      </button>
    </article>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              magicAI
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link 
              href="/" 
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-14">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              Simple, transparent pricing
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          <PricingCard
            title="Free"
            price="$0"
            description="Perfect for trying out the platform."
            features={freeFeatures}
            action="Start Free"
          />
          <PricingCard
            title="Pro"
            price="$19"
            description="For professionals who need more."
            features={proFeatures}
            action="Upgrade to Pro"
            highlighted
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            description="For teams with specific needs."
            features={enterpriseFeatures}
            action="Contact Sales"
            isEnterprise
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold">What counts as a website generation?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Each time you use AI to generate a new website or significantly modify an existing one counts as one generation. Editing existing content is free.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold">Can I upgrade or downgrade anytime?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any payments.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold">What payment methods do you accept?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-semibold">Is there a refund policy?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of users building beautiful websites with AI.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25"
          >
            Start Generating for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
