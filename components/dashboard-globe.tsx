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
        className="corner-marks liquid-glass relative h-[420px] overflow-hidden lg:h-[560px] lg:w-1/2"
      >
        <GlobeCanvas aircraft={aircraft} routes={routes} />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
          <p className="micro-label" style={{ color: '#C9A96A' }}>
            {data?.simulated
              ? 'AIR TRAFFIC · SIMULATED FEED'
              : 'LIVE AIR TRAFFIC · OPENSKY NETWORK'}
          </p>
          <p className="flex items-baseline gap-2">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 500,
                lineHeight: 1,
                color: '#F4F1EA',
              }}
            >
              {isLoading ? '—' : aircraft.length.toLocaleString()}
            </span>
            <span className="micro-label" style={{ color: '#8A8378' }}>
              AIRCRAFT TRACKED
            </span>
          </p>
        </div>
        {/* Route indicator */}
        {route && (
          <div
            className="glass-pill pointer-events-auto absolute bottom-4 left-4"
            style={{ padding: '0.5rem 0.875rem' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#C9A96A',
              }}
            >
              {route.origin} → {route.destination}
            </p>
            <button
              type="button"
              onClick={() => setRoute(null)}
              className="micro-label transition-colors"
              style={{ color: '#8A8378' }}
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
