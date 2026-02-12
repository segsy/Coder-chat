import { CirclePlus, HandHeart, PersonStanding, Sparkles, Trophy, Zap } from 'lucide-react';
import { SiteHeader } from '@/components/marketing/site-header';

const values = [
  { title: 'Own it', icon: Sparkles },
  { title: 'Win together', icon: HandHeart },
  { title: 'Move fast', icon: PersonStanding },
  { title: 'Make impact', icon: Trophy }
];

const team = [
  { name: 'Albert P.', role: 'Co-Founder, CTO' },
  { name: 'Eric S.', role: 'Co-Founder, CEO' },
  { name: 'Alex B.', role: 'Chief of Staff' },
  { name: 'Alejandro R.', role: 'Engineering' },
  { name: 'Alex K.', role: 'Engineering' },
  { name: 'Ari P.', role: 'Engineering' }
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#06090f] text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(28,95,170,.45),rgba(6,9,15,0.98)_58%)] px-6 pb-16 pt-14 text-center">
        <div className="mx-auto mb-6 h-72 max-w-md rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(40,160,255,.6),rgba(0,0,0,.95)_62%)] shadow-[0_0_80px_rgba(30,120,220,0.35)]" />
        <h1 className="mx-auto max-w-4xl text-6xl font-bold leading-tight md:text-7xl">Reimagine how software is built with Bolt.new</h1>
        <p className="mx-auto mt-5 max-w-3xl text-3xl text-zinc-400 md:text-4xl">Join us to change how millions of people build & deploy, forever.</p>
        <button className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 text-3xl font-medium">Open positions</button>
      </section>

      <section className="px-6 py-14 text-center">
        <p className="text-6xl italic text-zinc-200">Life at Bolt</p>
        <p className="mt-10 text-6xl">💙</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-6xl font-bold md:text-7xl">Our values, our success</h2>
        <p className="mx-auto mt-5 max-w-4xl text-3xl text-zinc-400 md:text-4xl">
          Living by our values is what allows us to succeed, find joy in our work, and produce our best work.
        </p>

        <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="rounded-3xl border border-white/15 bg-zinc-900/80 p-8 text-left">
                <div className="mb-20 flex items-start justify-between">
                  <CirclePlus className="size-8 text-zinc-500" />
                  <Icon className="size-12 text-zinc-500" />
                </div>
                <h3 className="text-6xl font-semibold">{value.title}</h3>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-6 max-w-6xl rounded-3xl bg-[#eb78e8] p-8 text-left text-4xl text-white md:text-5xl">
          Show up with energy, own your work, and support each other when it counts.
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(28,95,170,.45),rgba(6,9,15,0.98)_58%)] px-6 py-16 text-center">
        <h2 className="text-7xl font-bold md:text-8xl">Who we are</h2>
        <p className="mx-auto mt-5 max-w-5xl text-3xl text-zinc-300 md:text-4xl">
          We&apos;re a team of builders, designers, and dreamers reinventing how software is created.
        </p>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-3 gap-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="h-72 rotate-[-8deg] rounded-lg border-8 border-zinc-100 bg-gradient-to-br from-sky-200/40 to-blue-900/40" />
          ))}
        </div>
      </section>

      <section className="px-6 py-14 text-center">
        <h2 className="text-7xl font-bold md:text-8xl">Meet the team</h2>
        <p className="mt-4 text-3xl text-zinc-400 md:text-4xl">Say hello to the team that makes it all happen.</p>

        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-6">
          {team.map((member) => (
            <article key={member.name} className="text-center">
              <div className="h-64 rounded-2xl border border-white/20 bg-gradient-to-b from-zinc-400/40 to-zinc-700/40" />
              <h3 className="mt-3 text-4xl font-semibold">{member.name}</h3>
              <p className="text-3xl text-zinc-400">{member.role}</p>
            </article>
          ))}
        </div>

        <button className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-7 py-4 text-3xl font-medium">
          Join us <Zap className="size-6" />
        </button>
      </section>
    </main>
  );
}
