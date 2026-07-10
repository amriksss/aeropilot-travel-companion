import Link from 'next/link'
import { SectionLabel } from '@/components/section-label'

export default function Page() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 text-center">
        <SectionLabel>Boarding pass issued</SectionLabel>
        <h1 className="mt-2 text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We sent you a confirmation link. Confirm your email, then log in to
          start planning.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-sm border border-border px-4 py-2 text-xs uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Back to login
        </Link>
      </div>
    </main>
  )
}
