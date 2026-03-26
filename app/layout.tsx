import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from './header'
import { Providers } from './providers'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nexus AI builder. Websites, apps & prototypes',
  description: 'AI Powered Website and apps generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
