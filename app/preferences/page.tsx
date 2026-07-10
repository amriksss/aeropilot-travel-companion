import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { PreferencesForm } from '@/components/preferences-form'

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
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Pilot Profile
          </p>
          <h1 className="text-2xl font-semibold">Travel Preferences</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The AI companion reads these to personalize every recommendation.
          </p>
        </div>
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
      </main>
    </>
  )
}
