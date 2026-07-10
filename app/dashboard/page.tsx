import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { DashboardGlobe } from '@/components/dashboard-globe'

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
      <main className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
        {/* Faint dot-matrix */}
        <div className="pointer-events-none fixed inset-0 dot-matrix z-0" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-1">
          <p className="micro-label" style={{ color: '#E0201C' }}>
            FLIGHT DECK
          </p>
          <h1
            className="text-balance font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              lineHeight: 0.95,
              color: '#E8E6E1',
            }}
          >
            Welcome back, {profile?.display_name ?? 'traveler'}
          </h1>
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: '#8A8A85' }}
          >
            Track live global air traffic and scan routes with AI-graded fares.
          </p>
        </div>

        <div className="relative z-10">
          <DashboardGlobe homeAirport={profile?.home_airport} />
        </div>
      </main>
    </>
  )
}
