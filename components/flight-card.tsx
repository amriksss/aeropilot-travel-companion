'use client'

import { formatDuration } from '@/lib/flights/engine'
import type { FlightOffer } from '@/lib/flights/types'

function timeOf(iso: string): string {
  return iso.slice(11, 16)
}

export function FlightCard({
  offer,
  insight,
  onSave,
  saving,
  saved,
  compact,
}: {
  offer: FlightOffer
  insight?: string
  onSave?: (offer: FlightOffer) => void
  saving?: boolean
  saved?: boolean
  compact?: boolean
}) {
  const first = offer.legs[0]
  const last = offer.legs[offer.legs.length - 1]

  return (
    <article className="liquid-glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="micro-label" style={{ color: '#8A8378' }}>
            {offer.legs[0].airline}{' '}
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {offer.legs.map((l) => l.flightNumber).join(' · ')}
            </span>
          </p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  color: '#F4F1EA',
                }}
              >
                {timeOf(first.departTime)}
              </span>
              <span
                className="micro-label mt-1"
                style={{ color: '#8A8378', fontSize: '0.625rem' }}
              >
                {offer.origin}
              </span>
            </div>
            <div className="flex flex-col items-center px-1" aria-hidden="true">
              <span className="micro-label" style={{ color: '#8A8378', fontSize: '0.5625rem' }}>
                {formatDuration(offer.totalDurationMin)}
              </span>
              <span className="relative my-1.5 block h-px w-20" style={{ background: 'rgba(201, 169, 106, 0.35)' }}>
                <span
                  className="absolute -top-[2.5px] right-0 block size-[5px] rounded-full"
                  style={{ background: '#C9A96A' }}
                />
              </span>
              <span className="micro-label" style={{ color: '#8A8378', fontSize: '0.5625rem' }}>
                {offer.stops === 0 ? 'NONSTOP' : `1 STOP ${offer.via ?? ''}`}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  color: '#F4F1EA',
                }}
              >
                {timeOf(last.arriveTime)}
              </span>
              <span
                className="micro-label mt-1"
                style={{ color: '#8A8378', fontSize: '0.625rem' }}
              >
                {offer.destination}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 500,
              lineHeight: 1,
              color: '#C9A96A',
            }}
          >
            ${offer.price.toLocaleString()}
          </span>
          <span className="micro-label" style={{ color: '#8A8378', fontSize: '0.5625rem' }}>
            {offer.cabin.toUpperCase()} · {offer.seatsLeft} SEATS LEFT
          </span>
        </div>
      </div>

      {(insight || onSave) && (
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-4"
          style={{ borderTop: '1px solid rgba(201, 169, 106, 0.15)' }}
        >
          {insight ? (
            <span
              className="glass-pill micro-label"
              style={{
                padding: '0.3rem 0.75rem',
                color: '#C9A96A',
                fontSize: '0.5625rem',
              }}
            >
              <span
                className="size-1.5 rounded-full animate-pulse-dot"
                style={{ background: '#C9A96A' }}
                aria-hidden="true"
              />
              AI INSIGHT: {insight.toUpperCase()}
            </span>
          ) : (
            <span />
          )}
          {onSave && !compact && (
            <button
              type="button"
              onClick={() => onSave(offer)}
              disabled={saving || saved}
              className="editorial-btn py-1 px-3 disabled:opacity-50"
              style={{
                fontSize: '0.5625rem',
                color: saved ? '#C9A96A' : '#F4F1EA',
                borderColor: 'rgba(201, 169, 106, 0.35)',
              }}
            >
              <span>{saved ? 'SAVED ✓' : saving ? 'SAVING...' : 'SAVE TRIP'}</span>
            </button>
          )}
        </div>
      )}
    </article>
  )
}
