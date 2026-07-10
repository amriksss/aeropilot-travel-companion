import { NextResponse } from 'next/server'
import { AIRPORTS } from '@/lib/flights/airports'

type CompactAircraft = [string, number, number, number, number, string]

const SIM_ROUTES: Array<[string, string, string]> = [
  ['JFK', 'LHR', 'BAW'],
  ['LAX', 'NRT', 'ANA'],
  ['SFO', 'SIN', 'SIA'],
  ['ORD', 'FRA', 'DLH'],
  ['DFW', 'SYD', 'QFA'],
  ['MIA', 'GRU', 'LAT'],
  ['SEA', 'ICN', 'KAL'],
  ['BOS', 'CDG', 'AFR'],
  ['ATL', 'AMS', 'KLM'],
  ['DEN', 'MEX', 'AMX'],
  ['YYZ', 'HND', 'ACA'],
  ['LHR', 'DXB', 'UAE'],
  ['CDG', 'JNB', 'AFR'],
  ['FRA', 'DEL', 'DLH'],
  ['DXB', 'SYD', 'UAE'],
  ['SIN', 'LHR', 'SIA'],
  ['HKG', 'SFO', 'CPA'],
  ['MAD', 'EZE', 'IBE'],
  ['IST', 'BKK', 'THY'],
  ['DOH', 'MEL', 'QTR'],
]

function toRad(d: number) {
  return (d * Math.PI) / 180
}
function toDeg(r: number) {
  return (r * 180) / Math.PI
}

/** Point along the great circle between two coords at fraction f (0..1). */
function greatCirclePoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  f: number
): { lat: number; lon: number; heading: number } {
  const p1 = toRad(lat1)
  const l1 = toRad(lon1)
  const p2 = toRad(lat2)
  const l2 = toRad(lon2)
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((p2 - p1) / 2) ** 2 +
          Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2
      )
    )
  if (d === 0) return { lat: lat1, lon: lon1, heading: 0 }
  const a = Math.sin((1 - f) * d) / Math.sin(d)
  const b = Math.sin(f * d) / Math.sin(d)
  const x = a * Math.cos(p1) * Math.cos(l1) + b * Math.cos(p2) * Math.cos(l2)
  const y = a * Math.cos(p1) * Math.sin(l1) + b * Math.cos(p2) * Math.sin(l2)
  const z = a * Math.sin(p1) + b * Math.sin(p2)
  const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))
  const lon = toDeg(Math.atan2(y, x))
  const heading =
    (toDeg(
      Math.atan2(
        Math.sin(l2 - l1) * Math.cos(p2),
        Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1)
      )
    ) +
      360) %
    360
  return { lat, lon, heading }
}

/** Deterministic simulated traffic along real routes; positions drift over time. */
function simulatedTraffic(): CompactAircraft[] {
  const byIata = new Map(AIRPORTS.map((a) => [a.iata, a]))
  const t = Date.now() / 1000
  const aircraft: CompactAircraft[] = []
  SIM_ROUTES.forEach(([fromIata, toIata, airline], routeIdx) => {
    const from = byIata.get(fromIata)
    const to = byIata.get(toIata)
    if (!from || !to) return
    // 3 aircraft per route at staggered progress, looping over ~4h cycles
    for (let k = 0; k < 3; k++) {
      const cycle = 4 * 3600
      const phase = ((t + routeIdx * 977 + k * 1450) % cycle) / cycle
      const outbound = phase < 0.5
      const f = outbound ? phase * 2 : (phase - 0.5) * 2
      const pt = outbound
        ? greatCirclePoint(from.lat, from.lon, to.lat, to.lon, f)
        : greatCirclePoint(to.lat, to.lon, from.lat, from.lon, f)
      aircraft.push([
        `sim${routeIdx}${k}`,
        Math.round(pt.lon * 100) / 100,
        Math.round(pt.lat * 100) / 100,
        Math.round(pt.heading),
        230 + ((routeIdx * 7 + k * 13) % 30),
        `${airline}${100 + routeIdx * 10 + k}`,
      ])
    }
  })
  return aircraft
}

let cache: { data: CompactAircraft[]; ts: number } | null = null
const TTL_MS = 10_000
const MAX_AIRCRAFT = 2000
// After an upstream failure, skip retrying OpenSky for a while and serve simulated data
let upstreamFailedUntil = 0
const FAILURE_BACKOFF_MS = 120_000

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return NextResponse.json({ aircraft: cache.data, cached: true })
  }

  if (Date.now() < upstreamFailedUntil) {
    return NextResponse.json({ aircraft: simulatedTraffic(), simulated: true })
  }

  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`OpenSky responded ${res.status}`)
    const json = await res.json()
    const states: unknown[][] = json?.states ?? []

    const aircraft: CompactAircraft[] = []
    for (const s of states) {
      if (aircraft.length >= MAX_AIRCRAFT) break
      const icao24 = s[0] as string
      const callsign = ((s[1] as string) ?? '').trim()
      const lon = s[5] as number | null
      const lat = s[6] as number | null
      const onGround = s[8] as boolean
      const velocity = (s[9] as number | null) ?? 0
      const heading = (s[10] as number | null) ?? 0
      if (lon == null || lat == null || onGround) continue
      aircraft.push([
        icao24,
        Math.round(lon * 100) / 100,
        Math.round(lat * 100) / 100,
        Math.round(heading),
        Math.round(velocity),
        callsign,
      ])
    }

    cache = { data: aircraft, ts: Date.now() }
    return NextResponse.json({ aircraft, cached: false })
  } catch {
    upstreamFailedUntil = Date.now() + FAILURE_BACKOFF_MS
    // Serve stale cache if the upstream is flaky/rate-limited
    if (cache) {
      return NextResponse.json({ aircraft: cache.data, cached: true, stale: true })
    }
    // Fall back to simulated traffic along real routes so the globe stays alive
    return NextResponse.json({ aircraft: simulatedTraffic(), simulated: true })
  }
}
