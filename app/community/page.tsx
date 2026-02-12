import { ContentPage } from '@/components/marketing/content-page';

export default function CommunityPage() {
  return (
    <ContentPage
      title="Community"
      subtitle="Connect with builders, share projects, and get help from fellow creators."
      sections={[
        { heading: 'Discord community', body: 'Join live discussions, events, and office hours with product experts and creators.' },
        { heading: 'Show and tell', body: 'Share what you built, collect feedback, and inspire others with your product journey.' },
        { heading: 'Ambassador program', body: 'Grow your audience while helping others learn AI product development best practices.' },
        { heading: 'Open-source contributions', body: 'Contribute templates, integrations, and docs to shape the ecosystem with us.' }
      ]}
    />
  );
}
