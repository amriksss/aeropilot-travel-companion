import { AIRPORTS, getAirport, type Airport } from './airports'
import type {
  CabinClass,
  FlightLeg,
  FlightOffer,
  SearchParams,
} from './types'

// ---------- deterministic PRNG ----------

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- geo ----------

const EARTH_RADIUS_KM = 6371

export function greatCircleKm(a: Airport, b: Airport): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// avg cruise ~830 km/h + 40 min taxi/climb/descent
function flightDurationMin(km: number): number {
  return Math.round((km / 830) * 60 + 40)
}

// ---------- airlines ----------

const AIRLINES: { code: string; name: string; regions: string[] }[] = [
  { code: 'DL', name: 'Delta Air Lines', regions: ['US', 'CA', 'MX', 'GB', 'FR', 'NL', 'DE', 'IT', 'JP', 'KR'] },
  { code: 'UA', name: 'United Airlines', regions: ['US', 'CA', 'MX', 'GB', 'DE', 'JP', 'CN', 'HK', 'AU', 'SG', 'IN'] },
  { code: 'AA', name: 'American Airlines', regions: ['US', 'CA', 'MX', 'GB', 'ES', 'IT', 'JP', 'BR', 'AR'] },
  { code: 'BA', name: 'British Airways', regions: ['GB', 'US', 'FR', 'ES', 'IT', 'DE', 'IN', 'ZA', 'HK', 'SG'] },
  { code: 'AF', name: 'Air France', regions: ['FR', 'US', 'GB', 'DE', 'IT', 'BR', 'JP', 'CN', 'AE', 'ZA'] },
  { code: 'KL', name: 'KLM', regions: ['NL', 'US', 'GB', 'DE', 'SG', 'ZA', 'BR', 'IN'] },
  { code: 'LH', name: 'Lufthansa', regions: ['DE', 'US', 'GB', 'IT', 'ES', 'IN', 'CN', 'JP', 'BR', 'AT', 'CH'] },
  { code: 'EK', name: 'Emirates', regions: ['AE', 'US', 'GB', 'DE', 'IN', 'AU', 'SG', 'TH', 'ZA', 'BR', 'JP'] },
  { code: 'QR', name: 'Qatar Airways', regions: ['QA', 'US', 'GB', 'DE', 'IN', 'AU', 'SG', 'TH', 'ZA', 'JP'] },
  { code: 'SQ', name: 'Singapore Airlines', regions: ['SG', 'US', 'GB', 'AU', 'IN', 'JP', 'CN', 'TH', 'ID', 'MY', 'NZ'] },
  { code: 'NH', name: 'ANA', regions: ['JP', 'US', 'GB', 'DE', 'SG', 'CN', 'KR', 'TH', 'AU'] },
  { code: 'CX', name: 'Cathay Pacific', regions: ['HK', 'US', 'GB', 'AU', 'JP', 'SG', 'IN', 'CN'] },
  { code: 'TK', name: 'Turkish Airlines', regions: ['TR', 'US', 'GB', 'DE', 'FR', 'IT', 'AE', 'IN', 'ZA', 'EG', 'NG', 'KE'] },
  { code: 'QF', name: 'Qantas', regions: ['AU', 'US', 'GB', 'SG', 'JP', 'NZ', 'HK', 'ID'] },
  { code: 'LX', name: 'SWISS', regions: ['CH', 'US', 'GB', 'DE', 'IT', 'ES', 'IN', 'JP'] },
  { code: 'IB', name: 'Iberia', regions: ['ES', 'US', 'GB', 'FR', 'IT', 'MX', 'AR', 'CO', 'PE', 'CL', 'BR'] },
  { code: 'LA', name: 'LATAM Airlines', regions: ['BR', 'CL', 'PE', 'CO', 'AR', 'US', 'ES', 'AU'] },
  { code: 'AC', name: 'Air Canada', regions: ['CA', 'US', 'GB', 'FR', 'DE', 'JP', 'HK', 'AU'] },
]

function airlinesForRoute(o: Airport, d: Airport, rand: () => number) {
  const eligible = AIRLINES.filter(
    (al) => al.regions.includes(o.country) || al.regions.includes(d.country),
  )
  const pool = eligible.length >= 3 ? eligible : AIRLINES
  const shuffled = [...pool].sort(() => rand() - 0.5)
  return shuffled.slice(0, Math.min(4, shuffled.length))
}

// ---------- pricing ----------

// seasonal demand multiplier by month (0=Jan)
const SEASON_CURVE = [0.86, 0.84, 0.94, 0.98, 1.02, 1.16, 1.24, 1.2, 0.96, 0.94, 0.9, 1.14]

const CABIN_MULT: Record<CabinClass, number> = {
  economy: 1,
  premium: 1.8,
  business: 3.4,
  first: 5.5,
}

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T12:00:00Z`).getTime()
  const now = Date.now()
  return Math.max(0, Math.round((target - now) / 86400000))
}

function advanceMultiplier(days: number): number {
  if (days <= 3) return 1.75
  if (days <= 7) return 1.45
  if (days <= 14) return 1.25
  if (days <= 30) return 1.08
  if (days <= 60) return 0.96
  if (days <= 120) return 0.9
  return 0.95
}

export function basePriceUSD(km: number, cabin: CabinClass): number {
  // sub-linear distance pricing
  const base = 45 + 0.115 * km - 0.0000045 * km * km
  return Math.max(59, base) * CABIN_MULT[cabin]
}

export function priceFor(
  o: Airport,
  d: Airport,
  dateStr: string,
  cabin: CabinClass,
  jitterSeedExtra = '',
): number {
  const km = greatCircleKm(o, d)
  const date = new Date(`${dateStr}T12:00:00Z`)
  const month = date.getUTCMonth()
  const dow = date.getUTCDay()
  const weekendMult = dow === 5 || dow === 0 ? 1.12 : dow === 6 ? 1.05 : 1
  const rand = mulberry32(
    hashString(`${o.iata}-${d.iata}-${dateStr}-${cabin}-${jitterSeedExtra}`),
  )
  const jitter = 0.88 + rand() * 0.28 // 0.88 – 1.16
  const price =
    basePriceUSD(km, cabin) *
    SEASON_CURVE[month] *
    advanceMultiplier(daysUntil(dateStr)) *
    weekendMult *
    jitter
  return Math.round(price)
}

// seasonal average (no advance/day effects) for insight comparisons
export function seasonalAveragePrice(
  o: Airport,
  d: Airport,
  month: number,
  cabin: CabinClass,
): number {
  const km = greatCircleKm(o, d)
  return Math.round(basePriceUSD(km, cabin) * SEASON_CURVE[month])
}

// ---------- offer construction ----------

const DEPARTURE_SLOTS = [6.25, 8.5, 10.75, 13.0, 15.5, 17.75, 20.25]

function isoAt(dateStr: string, hourFloat: number): string {
  const h = Math.floor(hourFloat)
  const m = Math.round((hourFloat - h) * 60)
  return `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function addMinutes(iso: string, minutes: number): string {
  const dt = new Date(`${iso}Z`)
  dt.setUTCMinutes(dt.getUTCMinutes() + minutes)
  return dt.toISOString().slice(0, 19)
}

function pickHub(o: Airport, d: Airport): Airport | null {
  const direct = greatCircleKm(o, d)
  let best: Airport | null = null
  let bestDetour = Infinity
  for (const h of AIRPORTS) {
    if (!h.hub || h.iata === o.iata || h.iata === d.iata) continue
    const detour = greatCircleKm(o, h) + greatCircleKm(h, d) - direct
    // plausible hub: detour under 35% of the direct distance
    if (detour < direct * 0.35 && detour < bestDetour) {
      bestDetour = detour
      best = h
    }
  }
  return best
}

export function searchFlights(params: SearchParams): FlightOffer[] {
  const o = getAirport(params.origin)
  const d = getAirport(params.destination)
  if (!o || !d || o.iata === d.iata) return []
  const cabin = params.cabin ?? 'economy'
  const date = params.date
  const rand = mulberry32(hashString(`${o.iata}${d.iata}${date}${cabin}`))
  const km = greatCircleKm(o, d)
  const directDuration = flightDurationMin(km)
  const carriers = airlinesForRoute(o, d, rand)
  const offers: FlightOffer[] = []

  // direct flights
  const directCount = km > 9500 ? 2 : 3
  for (let i = 0; i < directCount; i++) {
    const airline = carriers[i % carriers.length]
    const slot = DEPARTURE_SLOTS[Math.floor(rand() * DEPARTURE_SLOTS.length)]
    const depart = isoAt(date, slot)
    const flightNumber = `${airline.code}${100 + Math.floor(rand() * 899)}`
    const price = priceFor(o, d, date, cabin, `direct-${i}`)
    offers.push({
      id: `${o.iata}${d.iata}-${date}-D${i}`,
      origin: o.iata,
      destination: d.iata,
      date,
      legs: [
        {
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber,
          origin: o.iata,
          destination: d.iata,
          departTime: depart,
          arriveTime: addMinutes(depart, directDuration),
          durationMin: directDuration,
        },
      ],
      stops: 0,
      totalDurationMin: directDuration,
      price: Math.round(price * (1 + i * 0.07)),
      currency: 'USD',
      cabin,
      seatsLeft: 2 + Math.floor(rand() * 8),
    })
  }

  // 1-stop via plausible hub
  const hub = pickHub(o, d)
  if (hub) {
    for (let i = 0; i < 2; i++) {
      const airline = carriers[(i + 1) % carriers.length]
      const slot = DEPARTURE_SLOTS[Math.floor(rand() * DEPARTURE_SLOTS.length)]
      const leg1Km = greatCircleKm(o, hub)
      const leg2Km = greatCircleKm(hub, d)
      const leg1Dur = flightDurationMin(leg1Km)
      const leg2Dur = flightDurationMin(leg2Km)
      const layover = 65 + Math.floor(rand() * 90)
      const depart = isoAt(date, slot)
      const leg1Arrive = addMinutes(depart, leg1Dur)
      const leg2Depart = addMinutes(leg1Arrive, layover)
      const directPrice = priceFor(o, d, date, cabin, `conn-${i}`)
      const price = Math.round(directPrice * (0.78 + rand() * 0.12))
      offers.push({
        id: `${o.iata}${d.iata}-${date}-C${i}`,
        origin: o.iata,
        destination: d.iata,
        date,
        legs: [
          {
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code}${100 + Math.floor(rand() * 899)}`,
            origin: o.iata,
            destination: hub.iata,
            departTime: depart,
            arriveTime: leg1Arrive,
            durationMin: leg1Dur,
          },
          {
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code}${100 + Math.floor(rand() * 899)}`,
            origin: hub.iata,
            destination: d.iata,
            departTime: leg2Depart,
            arriveTime: addMinutes(leg2Depart, leg2Dur),
            durationMin: leg2Dur,
          },
        ],
        stops: 1,
        via: hub.iata,
        totalDurationMin: leg1Dur + layover + leg2Dur,
        price,
        currency: 'USD',
        cabin,
        seatsLeft: 2 + Math.floor(rand() * 8),
      })
    }
  }

  return offers.sort((a, b) => a.price - b.price)
}

// ---------- analysis helpers (used by AI tools + insights) ----------

export function flexibleDatePrices(
  origin: string,
  destination: string,
  centerDate: string,
  windowDays: number,
): { date: string; price: number; cheapest: boolean }[] {
  const o = getAirport(origin)
  const d = getAirport(destination)
  if (!o || !d) return []
  const center = new Date(`${centerDate}T12:00:00Z`)
  const out: { date: string; price: number; cheapest: boolean }[] = []
  for (let off = -windowDays; off <= windowDays; off++) {
    const dt = new Date(center)
    dt.setUTCDate(dt.getUTCDate() + off)
    if (dt.getTime() < Date.now() - 86400000) continue
    const dateStr = dt.toISOString().slice(0, 10)
    const offers = searchFlights({ origin, destination, date: dateStr })
    if (offers.length === 0) continue
    out.push({ date: dateStr, price: offers[0].price, cheapest: false })
  }
  const min = Math.min(...out.map((x) => x.price))
  return out.map((x) => ({ ...x, cheapest: x.price === min }))
}

export function seasonalTrend(
  origin: string,
  destination: string,
): { month: string; avgPrice: number; demand: 'low' | 'medium' | 'high' }[] {
  const o = getAirport(origin)
  const d = getAirport(destination)
  if (!o || !d) return []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((m, i) => ({
    month: m,
    avgPrice: seasonalAveragePrice(o, d, i, 'economy'),
    demand:
      SEASON_CURVE[i] >= 1.12 ? 'high' : SEASON_CURVE[i] >= 0.95 ? 'medium' : 'low',
  }))
}

export function offerInsight(offer: FlightOffer): string {
  const o = getAirport(offer.origin)
  const d = getAirport(offer.destination)
  if (!o || !d) return 'Solid option for this route.'
  const month = new Date(`${offer.date}T12:00:00Z`).getUTCMonth()
  const seasonal = seasonalAveragePrice(o, d, month, offer.cabin)
  const delta = Math.round(((offer.price - seasonal) / seasonal) * 100)
  if (delta <= -12)
    return `Best value — ${Math.abs(delta)}% below seasonal average`
  if (delta <= -4) return `Good deal — ${Math.abs(delta)}% below seasonal average`
  if (delta >= 15 && offer.stops === 0)
    return `Premium for nonstop — ${delta}% above seasonal average`
  if (delta >= 15) return `Peak pricing — consider flexible dates`
  if (offer.stops === 0 && offer.totalDurationMin < 300)
    return 'Fastest option — nonstop and under 5 hours'
  if (offer.stops === 0) return 'Nonstop convenience at near-average price'
  if (offer.seatsLeft <= 3) return `Only ${offer.seatsLeft} seats left at this fare`
  return 'Fair price — within a few percent of seasonal average'
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}m`
}
