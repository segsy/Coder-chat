import { SiteHeader } from '@/components/marketing/site-header';

type ContentPageProps = {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
};

export function ContentPage({ title, subtitle, sections }: ContentPageProps) {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,120,195,0.3),rgba(17,19,27,0.96)_60%)] px-6 py-16 text-center">
        <h1 className="text-7xl font-bold md:text-8xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-4xl text-3xl text-zinc-400 md:text-4xl">{subtitle}</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
        {sections.map((section) => (
          <article key={section.heading} className="rounded-3xl border border-white/10 bg-zinc-900/75 p-8">
            <h2 className="text-4xl font-semibold md:text-5xl">{section.heading}</h2>
            <p className="mt-4 text-2xl leading-relaxed text-zinc-300 md:text-3xl">{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
