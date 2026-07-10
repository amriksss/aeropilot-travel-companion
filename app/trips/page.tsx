import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { TripsList } from '@/components/trips-list'
import { PageReveal } from '@/components/page-reveal'

export const metadata = {
  title: 'Saved Trips — AeroPilot',
}

export default async function TripsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <PageReveal>
          <div className="flex flex-col gap-2">
            <p className="micro-label" style={{ color: '#C9A96A' }}>
              LOGBOOK
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                fontWeight: 500,
                lineHeight: 1.05,
                color: '#F4F1EA',
              }}
            >
              Saved <em style={{ color: '#C9A96A' }}>Trips</em>
            </h1>
            <div
              className="h-px w-24"
              style={{ background: 'rgba(201, 169, 106, 0.5)' }}
              aria-hidden="true"
            />
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
            >
              Itineraries you saved from search results or via the AI companion.
            </p>
          </div>
          <div className="mt-6">
            <TripsList />
          </div>
        </PageReveal>
      </main>
    </>
  )
}
