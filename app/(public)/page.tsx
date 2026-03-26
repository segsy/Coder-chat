'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, SignInButton, UserButton, Show } from '@clerk/react';
import { Sparkles, ArrowRight, Layout, CreditCard, ShoppingCart, FileText, Zap, Palette, Globe, Code } from 'lucide-react';

// Template options for quick start
const templates = [
  { id: 'hero', name: 'Hero Section', icon: Layout, prompt: 'Create a modern hero section with headline, subtext, and CTA button' },
  { id: 'signup', name: 'Sign Up Form', icon: FileText, prompt: 'Build a sign up form with email and password fields' },
  { id: 'ecommerce', name: 'Ecommerce', icon: ShoppingCart, prompt: 'Design an ecommerce product page with gallery and buy button' },
  { id: 'pricing', name: 'Pricing', icon: CreditCard, prompt: 'Create a pricing section with 3 tiers and features' },
];

// Features to showcase
const features = [
  { icon: Sparkles, title: 'AI-Powered Generation', description: 'Describe your vision and let AI create stunning websites in seconds' },
  { icon: Code, title: 'Clean Code Export', description: 'Export production-ready React/Tailwind code instantly' },
  { icon: Palette, title: 'Inline Editing', description: 'Click any element to customize styles, text, and properties' },
  { icon: Globe, title: 'Publish Anywhere', description: 'Deploy to Vercel, Netlify, or download as ZIP' },
  { icon: Zap, title: 'Real-time Preview', description: 'See changes instantly with live preview as you edit' },
  { icon: Layout, title: 'Responsive Design', description: 'All generated sites work perfectly on mobile and desktop' },
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isSignedIn } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Will redirect to dashboard with prompt
    // In production, this would create a project and redirect
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  const handleTemplateClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Nexus AI
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors">
                    Get Started
                  </button>
                </SignInButton>
              </>
            )}
            
            {isSignedIn && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/20 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto max-w-5xl px-6">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-purple-200">AI-Powered Website Generation</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-center text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              What should we
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Design Today?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground">
            Generate, Edit and Explore design with AI. Describe your dream website and watch it come to life in seconds.
          </p>

          {/* Prompt Input */}
          <div className="mx-auto mt-10 max-w-3xl">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-30 blur transition-opacity group-hover:opacity-50" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0f] p-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your page design... (e.g., A modern SaaS landing page with hero, features, pricing, and contact form)"
                  className="w-full rounded-xl bg-transparent px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none resize-none min-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleGenerate();
                    }
                  }}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <p className="text-xs text-zinc-500">
                    Press ⌘ + Enter to generate
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Templates */}
          <div className="mt-8">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Or start with a template:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template.prompt)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
                >
                  <template.icon className="h-4 w-4" />
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                build stunning websites
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Powerful features that make website creation effortless
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition-all"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-12 text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Ready to build your dream website?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Start for free. No credit card required. Generate your first website in seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-zinc-100 transition-colors">
                      Get Started Free
                    </button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-zinc-100 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </Show>
                <Link
                  href="/pricing"
                  className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/20 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">NexusAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NexusAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
