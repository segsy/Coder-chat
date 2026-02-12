import { ContentPage } from '@/components/marketing/content-page';

export default function BlogPage() {
  return (
    <ContentPage
      title="Blog"
      subtitle="News, product updates, tutorials, and launch stories from Bolt builders."
      sections={[
        { heading: 'Product updates', body: 'Track every release with changelogs, new capabilities, and roadmap highlights.' },
        { heading: 'Developer guides', body: 'Deep-dive tutorials for building and shipping apps faster using AI workflows.' },
        { heading: 'Customer stories', body: 'See how teams, startups, and agencies use Bolt to go from idea to production.' },
        { heading: 'Growth and GTM', body: 'Learn how makers package, market, and monetize products built with Bolt.' }
      ]}
    />
  );
}
