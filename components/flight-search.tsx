'use client'

import { useState } from 'react'
import { AirportInput } from '@/components/airport-input'
import { FlightCard } from '@/components/flight-card'
import type { CabinClass, FlightOffer } from '@/lib/flights/types'
import { getAirport } from '@/lib/flights/airports'

type OfferWithInsight = FlightOffer & { insight: string }

function defaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 21)
  return d.toISOString().slice(0, 10)
}

const inputClass =
  'w-full px-3 py-2 text-sm outline-none transition-colors'

export function FlightSearch({
  initialOrigin,
  onRouteFound,
}: {
  initialOrigin?: string
  onRouteFound?: (origin: string, destination: string) => void
}) {
  const [origin, setOrigin] = useState(initialOrigin ?? 'JFK')
  const [destination, setDestination] = useState('LHR')
  const [date, setDate] = useState(defaultDate())
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [offers, setOffers] = useState<OfferWithInsight[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || origin === destination) {
      setError('Choose two different airports.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date, cabin }),
      })
      if (!res.ok) throw new Error('Search failed')
      const json = await res.json()
      setOffers(json.offers)
      onRouteFound?.(origin, destination)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveTrip = async (offer: FlightOffer) => {
    setSavingId(offer.id)
    try {
      const o = getAirport(offer.origin)
      const d = getAirport(offer.destination)
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${o?.city ?? offer.origin} to ${d?.city ?? offer.destination}`,
          trip_type: 'one-way',
          segments: [offer],
          total_price: offer.price,
          currency: offer.currency,
        }),
      })
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(offer.id))
      }
    } finally {
      setSavingId(null)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={search}
        className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5"
        style={{
          border: '1px solid rgba(138, 138, 133, 0.15)',
          background: 'rgba(232, 230, 225, 0.03)',
        }}
      >
        <AirportInput label="From" value={origin} onChange={setOrigin} />
        <AirportInput label="To" value={destination} onChange={setDestination} />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="depart-date"
            className="micro-label"
            style={{ color: '#8A8A85' }}
          >
            DEPART
          </label>
          <input
            id="depart-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            style={{
              fontFamily: 'var(--font-body)',
              background: '#0C0C0C',
              color: '#E8E6E1',
              border: '1px solid rgba(138, 138, 133, 0.2)',
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="cabin-class"
            className="micro-label"
            style={{ color: '#8A8A85' }}
          >
            CABIN
          </label>
          <select
            id="cabin-class"
            value={cabin}
            onChange={(e) => setCabin(e.target.value as CabinClass)}
            className={inputClass}
            style={{
              fontFamily: 'var(--font-body)',
              background: '#0C0C0C',
              color: '#E8E6E1',
              border: '1px solid rgba(138, 138, 133, 0.2)',
            }}
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="editorial-btn w-full justify-center disabled:opacity-50"
            style={{
              background: '#E0201C',
              color: '#E8E6E1',
              borderColor: '#E0201C',
              fontSize: '0.625rem',
            }}
          >
            <span>{loading ? 'SCANNING...' : 'SEARCH'}</span>
            {!loading && <span className="arrow">↗</span>}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-sm" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}

      {offers && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="micro-label" style={{ color: '#8A8A85' }}>
            {offers.length} ROUTES FOUND · SORTED BY PRICE
          </p>
          {offers.map((o) => (
            <FlightCard
              key={o.id}
              offer={o}
              insight={o.insight}
              onSave={saveTrip}
              saving={savingId === o.id}
              saved={savedIds.has(o.id)}
            />
          ))}
          {offers.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', color: '#8A8A85', fontSize: '0.875rem' }}>
              No routes found between these airports.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
