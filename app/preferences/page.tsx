import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { PreferencesForm } from '@/components/preferences-form'
import { PageReveal } from '@/components/page-reveal'

export const metadata = {
  title: 'Preferences — AeroPilot',
}

export default async function PreferencesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'display_name, home_airport, seat_preference, cabin_class, prefers_direct, budget_level, preferred_airlines',
    )
    .eq('id', user.id)
    .single()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <PageReveal>
        <div className="flex flex-col gap-2">
          <p className="micro-label" style={{ color: '#C9A96A' }}>
            PILOT PROFILE
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
            Travel <em style={{ color: '#C9A96A' }}>Preferences</em>
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
            The AI companion reads these to personalize every recommendation.
          </p>
        </div>
        <div className="mt-6">
        <PreferencesForm
          userId={user.id}
          profile={
            profile ?? {
              display_name: null,
              home_airport: null,
              seat_preference: null,
              cabin_class: null,
              prefers_direct: null,
              budget_level: null,
              preferred_airlines: null,
            }
          }
        />
        </div>
        </PageReveal>
      </main>
    </>
  )
}
