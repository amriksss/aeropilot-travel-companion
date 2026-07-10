'use client'

import useSWR from 'swr'

type Segment = {
  origin: string
  destination: string
  date?: string
  airline?: string
  price?: number
  legs?: { origin: string; destination: string }[]
}

type Trip = {
  id: string
  title: string
  trip_type: string
  segments: Segment[]
  total_price: number | null
  currency: string
  notes: string | null
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function TripsList() {
  const { data, isLoading, mutate } = useSWR<{ trips: Trip[] }>(
    '/api/trips',
    fetcher,
  )

  const remove = async (id: string) => {
    await fetch(`/api/trips?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  if (isLoading) {
    return (
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Loading trips...
      </p>
    )
  }

  const trips = data?.trips ?? []

  if (trips.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No saved trips yet. Search flights on the dashboard or ask the AI
          companion to save an itinerary for you.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {trips.map((trip) => (
        <li key={trip.id}>
          <article className="rounded-md border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-balance">{trip.title}</h2>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {trip.trip_type} · saved{' '}
                  {new Date(trip.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {trip.total_price != null && (
                  <span className="font-mono text-lg font-semibold text-primary">
                    ${Number(trip.total_price).toLocaleString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(trip.id)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
            <ol className="mt-3 flex flex-col gap-1 border-t border-border pt-3">
              {trip.segments.map((s, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-2 font-mono text-sm"
                >
                  <span className="text-primary">{s.origin}</span>
                  <span className="text-muted-foreground" aria-hidden="true">
                    →
                  </span>
                  <span className="text-primary">{s.destination}</span>
                  {s.date && (
                    <span className="text-xs text-muted-foreground">{s.date}</span>
                  )}
                  {s.airline && (
                    <span className="text-xs text-muted-foreground">
                      {s.airline}
                    </span>
                  )}
                </li>
              ))}
            </ol>
            {trip.notes && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {trip.notes}
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}
