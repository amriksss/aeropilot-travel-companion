'use client'

import { FlightCard } from '@/components/flight-card'
import { formatDuration } from '@/lib/flights/engine'
import type { FlightOffer } from '@/lib/flights/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

function CardShell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary/50 p-3">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">
        {label}
      </p>
      {children}
    </div>
  )
}

function ErrorNote({ message }: { message: string }) {
  return <p className="text-sm text-destructive">{message}</p>
}

export function SearchFlightsCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  const offers: FlightOffer[] = output?.offers ?? []
  return (
    <CardShell label={`Flight results · ${offers.length} options`}>
      <div className="flex flex-col gap-2">
        {offers.map((o) => (
          <FlightCard key={o.id} offer={o} compact />
        ))}
      </div>
    </CardShell>
  )
}

export function MultiCityCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  const legs: any[] = output?.legs ?? []
  return (
    <CardShell label="Multi-city itinerary">
      <ol className="flex flex-col gap-2">
        {legs.map((leg, i) => (
          <li key={`${leg.origin}-${leg.destination}-${i}`} className="flex flex-col gap-1">
            <p className="font-mono text-xs text-muted-foreground">
              Leg {i + 1} · {leg.date}
            </p>
            {leg.best ? (
              <FlightCard offer={leg.best} compact />
            ) : (
              <p className="text-sm text-muted-foreground">
                No offers for {leg.origin} → {leg.destination}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Trip total
        </span>
        <span className="font-mono text-lg font-semibold text-primary">
          ${Number(output?.totalPrice ?? 0).toLocaleString()}
        </span>
      </div>
      {output?.warning && <ErrorNote message={output.warning} />}
    </CardShell>
  )
}

export function CompareCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  const a = output?.analysis
  return (
    <CardShell label="Direct vs connecting">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Best direct
          </p>
          {output?.bestDirect ? (
            <FlightCard offer={output.bestDirect} compact />
          ) : (
            <p className="text-sm text-muted-foreground">None available</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Best connecting
          </p>
          {output?.bestConnecting ? (
            <FlightCard offer={output.bestConnecting} compact />
          ) : (
            <p className="text-sm text-muted-foreground">None available</p>
          )}
        </div>
      </div>
      {a && (
        <p className="border-t border-border pt-2 text-sm leading-relaxed text-muted-foreground">
          Connecting saves{' '}
          <span className="font-mono text-foreground">
            ${Math.abs(a.savingsUSD).toLocaleString()}
          </span>{' '}
          {a.savingsUSD >= 0 ? 'less' : 'more'} for{' '}
          <span className="font-mono text-foreground">{a.extraTimeFormatted}</span>{' '}
          extra travel time
          {a.savingsPerHour > 0 && (
            <>
              {' '}
              (≈{' '}
              <span className="font-mono text-foreground">
                ${a.savingsPerHour}/hr
              </span>{' '}
              of your time)
            </>
          )}
          .
        </p>
      )}
    </CardShell>
  )
}

export function FlexibleDatesCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  const prices: { date: string; price: number; cheapest: boolean }[] =
    output?.prices ?? []
  const max = Math.max(...prices.map((p) => p.price), 1)
  return (
    <CardShell
      label={`Flexible dates · ${output?.origin} → ${output?.destination}`}
    >
      <ul className="flex flex-col gap-1.5">
        {prices.map((p) => (
          <li key={p.date} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
              {p.date.slice(5)}
            </span>
            <span
              className={`h-2 rounded-sm ${p.cheapest ? 'bg-primary' : 'bg-border'}`}
              style={{ width: `${Math.max(8, (p.price / max) * 100)}%` }}
              aria-hidden="true"
            />
            <span
              className={`font-mono text-xs ${p.cheapest ? 'font-semibold text-primary' : 'text-foreground'}`}
            >
              ${p.price.toLocaleString()}
              {p.cheapest && <span className="sr-only"> (cheapest)</span>}
            </span>
          </li>
        ))}
      </ul>
      {output?.cheapest && (
        <p className="text-xs text-muted-foreground">
          Cheapest day: <span className="font-mono text-primary">{output.cheapest.date}</span>
        </p>
      )}
    </CardShell>
  )
}

export function SeasonalTrendsCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  const trend: { month: string; avgPrice: number; demand: string }[] =
    output?.trend ?? []
  const max = Math.max(...trend.map((t) => t.avgPrice), 1)
  return (
    <CardShell
      label={`Seasonal pricing · ${output?.origin} → ${output?.destination}`}
    >
      <div className="flex items-end gap-1" role="img" aria-label="Monthly average price chart">
        {trend.map((t) => (
          <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">
              ${Math.round(t.avgPrice / 10) * 10}
            </span>
            <div
              className={`w-full rounded-sm ${
                t.month === output?.cheapestMonth ? 'bg-primary' : 'bg-border'
              }`}
              style={{ height: `${Math.max(10, (t.avgPrice / max) * 72)}px` }}
            />
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {t.month}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Cheapest month:{' '}
        <span className="font-mono text-primary">{output?.cheapestMonth}</span>
      </p>
    </CardShell>
  )
}

export function SaveTripCard({ output }: { output: any }) {
  if (output?.error) return <ErrorNote message={output.error} />
  return (
    <CardShell label="Trip saved">
      <p className="text-sm">
        <span className="font-semibold">{output?.title}</span> was added to your
        trips.
      </p>
    </CardShell>
  )
}

export function ToolLoading({ name }: { name: string }) {
  const labels: Record<string, string> = {
    searchFlights: 'Scanning routes',
    planMultiCity: 'Planning itinerary',
    compareDirectVsConnecting: 'Comparing options',
    flexibleDates: 'Checking nearby dates',
    seasonalTrends: 'Analyzing seasonal pricing',
    saveTrip: 'Saving trip',
  }
  return (
    <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      {labels[name] ?? 'Working'}...
    </p>
  )
}

export function formatToolDuration(min: number) {
  return formatDuration(min)
}
