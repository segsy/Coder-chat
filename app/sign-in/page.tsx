import { Github } from 'lucide-react';
import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8 text-center">
          <h1 className="text-8xl font-black italic">bolt</h1>
          <p className="mx-auto mt-6 max-w-xl text-3xl text-zinc-300">
            To use Bolt, sign in to your existing account using one of the options below.
          </p>

          <div className="mt-8 space-y-4">
            <button className="w-full rounded-2xl bg-white/10 px-5 py-4 text-3xl">Sign in with Google</button>
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-3xl">
              <Github className="size-6" /> Sign in with GitHub
            </button>
            <button className="w-full rounded-2xl bg-white/10 px-5 py-4 text-3xl">Sign in with email and password</button>
          </div>

          <p className="mt-7 text-2xl text-zinc-400">
            By signing in, you accept the <Link href="#" className="underline">Terms of Service</Link> and acknowledge our{' '}
            <Link href="#" className="underline">Privacy Policy</Link>.
          </p>

          <p className="mt-8 text-2xl text-zinc-400">
            Don&apos;t have an account? <Link href="/sign-up" className="text-blue-400 underline">Get started</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
