import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { DashboardGlobe } from '@/components/dashboard-globe'
import { PageReveal } from '@/components/page-reveal'

export const metadata = {
  title: 'Dashboard — AeroPilot',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, home_airport')
    .eq('id', user.id)
    .single()

  return (
    <>
      <SiteHeader />
      <main className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10">
        <PageReveal>
          <div className="flex flex-col gap-2">
            <p className="micro-label" style={{ color: '#C9A96A' }}>
              FLIGHT DECK
            </p>
            <h1
              className="text-balance"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                fontWeight: 500,
                lineHeight: 1.05,
                color: '#F4F1EA',
              }}
            >
              Welcome back,{' '}
              <em style={{ color: '#C9A96A' }}>{profile?.display_name ?? 'traveler'}</em>
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
              Track live global air traffic and scan routes with AI-graded fares.
            </p>
          </div>

          <div className="mt-6">
            <DashboardGlobe homeAirport={profile?.home_airport} />
          </div>
        </PageReveal>
      </main>
    </>
  )
}
