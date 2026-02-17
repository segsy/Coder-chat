import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'AI Video Educational Course Generator SaaS',
  description: 'Production-style SaaS app to generate educational video courses with AI agents, Stripe billing, Clerk auth, and Neon/Drizzle persistence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
