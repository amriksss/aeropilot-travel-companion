'use client'

import { useId, useMemo, useState } from 'react'
import { searchAirports, getAirport, type Airport } from '@/lib/flights/airports'

export function AirportInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (iata: string) => void
}) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const results = useMemo(() => searchAirports(query), [query])
  const selected = value ? getAirport(value) : undefined

  const select = (a: Airport) => {
    onChange(a.iata)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="micro-label"
        style={{ color: '#8A8378' }}
      >
        {label.toUpperCase()}
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        autoComplete="off"
        placeholder={selected ? `${selected.iata} — ${selected.city}` : 'City or code'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="lux-input"
      />
      {open && results.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="liquid-glass absolute top-full z-20 mt-1 w-full overflow-hidden"
          style={{ background: 'rgba(16, 15, 13, 0.92)' }}
        >
          {results.map((a) => (
            <li key={a.iata} role="option" aria-selected={a.iata === value}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(a)
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: '#F4F1EA',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 169, 106, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span>
                  {a.city}{' '}
                  <span style={{ color: '#8A8378' }}>{a.name}</span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#C9A96A',
                  }}
                >
                  {a.iata}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
