import Link from 'next/link'
import { PageReveal } from '@/components/page-reveal'

export default function Page() {
  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute left-1/2 bottom-[-40%] h-[70vh] w-[110vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201,169,106,0.09) 0%, transparent 62%)',
        }}
        aria-hidden="true"
      />

      <PageReveal className="w-full max-w-md">
        <div data-reveal className="liquid-glass p-10 text-center">
          <p className="micro-label" style={{ color: '#C9A96A' }}>
            BOARDING PASS ISSUED
          </p>
          <h1
            className="mt-4 text-balance"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 500,
              color: '#F4F1EA',
              lineHeight: 1.05,
            }}
          >
            Check your <em style={{ color: '#C9A96A' }}>email</em>
          </h1>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
          >
            We sent you a confirmation link. Confirm your email, then log in to
            start planning your journeys.
          </p>
          <Link href="/auth/login" className="editorial-btn mt-8 inline-flex">
            <span>BACK TO LOGIN</span>
            <span className="arrow">↗</span>
          </Link>
        </div>
      </PageReveal>
    </main>
  )
}
