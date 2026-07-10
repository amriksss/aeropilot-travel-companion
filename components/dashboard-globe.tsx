'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { GlobeCanvas } from '@/components/globe-canvas'
import { FlightSearch } from '@/components/flight-search'
import { getAirport } from '@/lib/flights/airports'
import type { AircraftPosition, RouteArc } from '@/lib/flights/types'

type CompactAircraft = [string, number, number, number, number, string]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DashboardGlobe({ homeAirport }: { homeAirport?: string | null }) {
  const { data, isLoading } = useSWR<{ aircraft: CompactAircraft[]; simulated?: boolean }>(
    '/api/live-flights',
    fetcher,
    { refreshInterval: 15_000, revalidateOnFocus: false },
  )
  const [route, setRoute] = useState<{ origin: string; destination: string } | null>(null)

  const aircraft: AircraftPosition[] = useMemo(
    () =>
      (data?.aircraft ?? []).map((a) => ({
        icao24: a[0],
        lon: a[1],
        lat: a[2],
        heading: a[3],
        velocity: a[4],
        callsign: a[5],
      })),
    [data],
  )

  const routes: RouteArc[] = useMemo(() => {
    if (!route) return []
    const o = getAirport(route.origin)
    const d = getAirport(route.destination)
    if (!o || !d) return []
    return [
      {
        from: { lat: o.lat, lon: o.lon, iata: o.iata },
        to: { lat: d.lat, lon: d.lon, iata: d.iata },
      },
    ]
  }, [route])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <section
        aria-label="Live global air traffic"
        className="corner-marks relative h-[420px] overflow-hidden lg:h-[560px] lg:w-1/2"
        style={{
          border: '1px solid rgba(138, 138, 133, 0.15)',
          background: '#0C0C0C',
        }}
      >
        <GlobeCanvas aircraft={aircraft} routes={routes} />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
          <p className="micro-label" style={{ color: '#8A8A85' }}>
            {data?.simulated
              ? 'AIR TRAFFIC · SIMULATED FEED'
              : 'LIVE AIR TRAFFIC · OPENSKY NETWORK'}
          </p>
          <p className="flex items-baseline gap-2">
            <span
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                lineHeight: 1,
                color: '#E8E6E1',
              }}
            >
              {isLoading ? '—' : aircraft.length.toLocaleString()}
            </span>
            <span className="micro-label" style={{ color: '#8A8A85' }}>
              AIRCRAFT TRACKED
            </span>
          </p>
        </div>
        {/* Route indicator */}
        {route && (
          <div
            className="pointer-events-auto absolute bottom-4 left-4 flex items-center gap-3 px-3 py-2 backdrop-blur-sm"
            style={{
              border: '1px solid rgba(224, 32, 28, 0.4)',
              background: 'rgba(12, 12, 12, 0.8)',
            }}
          >
            <p
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                color: '#E0201C',
              }}
            >
              {route.origin} → {route.destination}
            </p>
            <button
              type="button"
              onClick={() => setRoute(null)}
              className="micro-label transition-colors hover:text-foreground"
              style={{ color: '#8A8A85' }}
            >
              CLEAR ✕
            </button>
          </div>
        )}
      </section>

      <div className="flex-1">
        <FlightSearch
          initialOrigin={homeAirport ?? undefined}
          onRouteFound={(origin, destination) => setRoute({ origin, destination })}
        />
      </div>
    </div>
  )
}
