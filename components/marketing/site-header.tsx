'use client';

import Link from 'next/link';
import { Disc3, Linkedin, Menu, Reddit, Twitter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Community', href: '/community' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Careers', href: '/careers' },
  { label: 'Pricing', href: '/pricing' }
];

const resourceItems = [
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Documentation', href: '/documentation' }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#11131b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link className="text-4xl font-black italic tracking-tight" href="/">
            bolt<span className="align-top text-lg not-italic">.new</span>
          </Link>
          <div className="flex items-center gap-5 text-zinc-300">
            <Disc3 className="size-6" />
            <Linkedin className="size-6" />
            <Twitter className="size-6" />
            <Reddit className="size-6" />
            <button aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-[#11131b] text-white">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
            <Link className="text-4xl font-black italic tracking-tight" href="/" onClick={() => setOpen(false)}>
              bolt<span className="align-top text-lg not-italic">.new</span>
            </Link>
            <div className="flex items-center gap-5 text-zinc-300">
              <Disc3 className="size-6" />
              <Linkedin className="size-6" />
              <Twitter className="size-6" />
              <Reddit className="size-6" />
              <button aria-label="Close menu" className="rounded-xl bg-white/10 p-3" onClick={() => setOpen(false)}>
                <X className="size-6" />
              </button>
            </div>
          </div>

          <nav className="mx-auto flex max-w-6xl flex-col gap-8 px-8 pb-8 pt-10 text-5xl font-semibold">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <button className="inline-flex items-center gap-3 text-left" onClick={() => setResourcesOpen((prev) => !prev)}>
              Resources <ChevronDown className="size-8" />
            </button>
            {resourcesOpen && (
              <div className="ml-4 flex flex-col gap-4 text-3xl font-medium text-zinc-300">
                {resourceItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div className="fixed bottom-8 left-0 right-0 mx-auto flex w-[90%] max-w-4xl flex-col gap-4">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-white/10 px-6 py-5 text-center text-3xl font-medium text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-blue-600 px-6 py-5 text-center text-3xl font-medium text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
