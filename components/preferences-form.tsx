'use client'

import { useState } from 'react'
import { AirportInput } from '@/components/airport-input'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  display_name: string | null
  home_airport: string | null
  seat_preference: string | null
  cabin_class: string | null
  prefers_direct: boolean | null
  budget_level: string | null
  preferred_airlines: string[] | null
}

const AIRLINE_OPTIONS = [
  'Delta Air Lines',
  'United Airlines',
  'American Airlines',
  'British Airways',
  'Air France',
  'Lufthansa',
  'Emirates',
  'Qatar Airways',
  'Singapore Airlines',
  'ANA',
  'Turkish Airlines',
  'Qantas',
]

export function PreferencesForm({
  userId,
  profile,
}: {
  userId: string
  profile: Profile
}) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [homeAirport, setHomeAirport] = useState(profile.home_airport ?? '')
  const [seat, setSeat] = useState(profile.seat_preference ?? 'window')
  const [cabin, setCabin] = useState(profile.cabin_class ?? 'economy')
  const [direct, setDirect] = useState(profile.prefers_direct ?? true)
  const [budget, setBudget] = useState(profile.budget_level ?? 'moderate')
  const [airlines, setAirlines] = useState<string[]>(
    profile.preferred_airlines ?? [],
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const toggleAirline = (name: string) => {
    setAirlines((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    )
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        home_airport: homeAirport || null,
        seat_preference: seat,
        cabin_class: cabin,
        prefers_direct: direct,
        budget_level: budget,
        preferred_airlines: airlines,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    setSaving(false)
    setMessage(error ? 'Could not save preferences.' : 'Preferences saved. The AI companion will use them.')
  }

  const selectClass =
    'rounded-sm border border-border bg-secondary px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none'

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="display-name"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Display name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={selectClass}
          />
        </div>
        <AirportInput
          label="Home airport"
          value={homeAirport}
          onChange={setHomeAirport}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="seat-pref"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Seat preference
          </label>
          <select
            id="seat-pref"
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            className={selectClass}
          >
            <option value="window">Window</option>
            <option value="aisle">Aisle</option>
            <option value="middle">Middle (really?)</option>
            <option value="no-preference">No preference</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="cabin-pref"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Default cabin
          </label>
          <select
            id="cabin-pref"
            value={cabin}
            onChange={(e) => setCabin(e.target.value)}
            className={selectClass}
          >
            <option value="economy">Economy</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="budget-pref"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Budget level
          </label>
          <select
            id="budget-pref"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={selectClass}
          >
            <option value="budget">Budget — cheapest wins</option>
            <option value="moderate">Moderate — balance price and comfort</option>
            <option value="premium">Premium — comfort first</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={direct}
              onChange={(e) => setDirect(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="text-sm">Prefer direct flights</span>
          </label>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs uppercase tracking-widest text-muted-foreground">
          Preferred airlines
        </legend>
        <div className="flex flex-wrap gap-2">
          {AIRLINE_OPTIONS.map((name) => {
            const active = airlines.includes(name)
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAirline(name)}
                className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? 'border-primary bg-secondary text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </form>
  )
}
