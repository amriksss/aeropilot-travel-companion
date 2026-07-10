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
    <article
      className="p-4"
      style={{
        border: '1px solid rgba(138, 138, 133, 0.15)',
        background: 'rgba(232, 230, 225, 0.03)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="micro-label" style={{ color: '#8A8A85' }}>
            {first.airline}{' '}
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {offer.legs.map((l) => l.flightNumber).join(' · ')}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span
                className="font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  color: '#E8E6E1',
                }}
              >
                {timeOf(first.departTime)}
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  color: '#8A8A85',
                }}
              >
                {offer.origin}
              </span>
            </div>
            <div className="flex flex-col items-center px-1" aria-hidden="true">
              <span className="micro-label" style={{ color: '#8A8A85', fontSize: '0.5625rem' }}>
                {formatDuration(offer.totalDurationMin)}
              </span>
              <span
                className="my-1 block h-px w-16"
                style={{ background: 'rgba(138, 138, 133, 0.2)' }}
              />
              <span className="micro-label" style={{ color: '#8A8A85', fontSize: '0.5625rem' }}>
                {offer.stops === 0 ? 'NONSTOP' : `1 STOP ${offer.via ?? ''}`}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  color: '#E8E6E1',
                }}
              >
                {timeOf(last.arriveTime)}
              </span>
              <span
                className="font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  color: '#8A8A85',
                }}
              >
                {offer.destination}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: '#E0201C',
            }}
          >
            ${offer.price.toLocaleString()}
          </span>
          <span className="micro-label" style={{ color: '#8A8A85', fontSize: '0.5625rem' }}>
            {offer.cabin.toUpperCase()} · {offer.seatsLeft} SEATS LEFT
          </span>
        </div>
      </div>

      {(insight || onSave) && (
        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-3"
          style={{ borderTop: '1px solid rgba(138, 138, 133, 0.1)' }}
        >
          {insight ? (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-1 micro-label"
              style={{
                background: 'rgba(232, 230, 225, 0.05)',
                color: '#8A8A85',
                fontSize: '0.5625rem',
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: '#E0201C' }}
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
                color: '#E8E6E1',
                borderColor: 'rgba(138, 138, 133, 0.2)',
              }}
            >
              <span>{saved ? 'SAVED' : saving ? 'SAVING...' : 'SAVE TRIP'}</span>
            </button>
          )}
        </div>
      )}
    </article>
  )
}
