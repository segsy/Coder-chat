import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <nav className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="font-semibold">AI Course SaaS</Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm">Pricing</Link>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg border px-3 py-2 text-sm">Sign in</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <section className="mx-auto mt-16 max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight">Generate complete video course content from one prompt</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Outline to lessons to scripts to narration-ready content. Built with Next.js, Drizzle, Neon, and Clerk.
        </p>

        <div className="mt-8 flex gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">Get started</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="rounded-lg bg-black px-4 py-2 text-sm text-white">Go to Dashboard</Link>
          </SignedIn>

          <Link href="/pricing" className="rounded-lg border px-4 py-2 text-sm">View pricing</Link>
        </div>
      </section>
    </main>
  );
}
