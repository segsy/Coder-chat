import { SignUp } from '@clerk/nextjs'
import { SiteHeader } from '@/components/marketing/site-header'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#11131b] text-white">
      <SiteHeader />

      <section className="mx-auto flex max-w-3xl items-center justify-center px-6 py-12">
        <SignUp />
      </section>
    </main>
  )
}
