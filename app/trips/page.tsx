import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { TripsList } from '@/components/trips-list'

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
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Logbook
          </p>
          <h1 className="text-2xl font-semibold">Saved Trips</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Itineraries you saved from search results or via the AI companion.
          </p>
        </div>
        <TripsList />
      </main>
    </>
  )
}
