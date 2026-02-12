import { Github } from 'lucide-react';
import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/site-header';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8 text-center">
          <h1 className="text-8xl font-black italic">Create account</h1>
          <p className="mx-auto mt-6 max-w-xl text-3xl text-zinc-300">
            Start building with Bolt in minutes. Choose your preferred signup method.
          </p>

          <div className="mt-8 space-y-4">
            <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-3xl">Sign up with Google</button>
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-3xl">
              <Github className="size-6" /> Sign up with GitHub
            </button>
          </div>

          <div className="my-6 text-2xl text-zinc-500">or</div>

          <form className="space-y-4 text-left">
            <input className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-2xl" placeholder="Email" type="email" />
            <input className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-2xl" placeholder="Password" type="password" />
            <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-3xl font-medium">Create account</button>
          </form>

          <p className="mt-8 text-2xl text-zinc-400">
            Already have an account? <Link href="/sign-in" className="text-blue-400 underline">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
