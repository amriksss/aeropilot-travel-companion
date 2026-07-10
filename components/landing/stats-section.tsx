'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

const STATS = [
  { number: 70, suffix: '+', label: 'Airports Worldwide', caption: 'Global Coverage' },
  { number: 500, suffix: 'K+', label: 'Daily Flights Tracked', caption: 'OpenSky Network' },
  { number: 6, suffix: '', label: 'Concierge Tools', caption: 'AI-Powered Intelligence' },
  { number: 24, suffix: '/7', label: 'Real-Time Data', caption: 'Live Streaming' },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      rowRefs.current.forEach((row, i) => {
        if (!row) return

        if (!reducedMotion) {
          gsap.from(row, {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          })
        }

        const numEl = numberRefs.current[i]
        if (!numEl) return

        const target = STATS[i].number
        const obj = { val: 0 }

        ScrollTrigger.create({
          trigger: row,
          start: 'top 82%',
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: reducedMotion ? 0 : 2.2,
              ease: 'power4.out',
              onUpdate: () => {
                if (numEl) numEl.textContent = Math.floor(obj.val).toString()
              },
            })
          },
          once: true,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="section-dark relative py-32 md:py-48 overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        <p className="micro-label mb-4 text-center" style={{ color: '#C9A96A' }}>
          BY THE NUMBERS
        </p>
        <div className="gold-hairline mb-16 max-w-xs mx-auto" aria-hidden="true" />

        <div className="flex flex-col">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              ref={(el) => { rowRefs.current[i] = el }}
              className="py-10 md:py-14 flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8"
              style={{ borderTop: '1px solid rgba(138, 131, 120, 0.18)' }}
            >
              {/* Number + suffix */}
              <div className="flex items-baseline gap-1 md:w-56 flex-shrink-0">
                <span
                  ref={(el) => { numberRefs.current[i] = el }}
                  className="text-display-sm"
                  style={{ color: '#F4F1EA' }}
                >
                  0
                </span>
                <span
                  className="text-2xl md:text-4xl"
                  style={{ color: '#C9A96A', fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className="text-lg md:text-xl tracking-wide"
                  style={{ fontFamily: 'var(--font-body)', color: '#F4F1EA', fontWeight: 400 }}
                >
                  {stat.label}
                </p>
                <p className="mt-1 text-lg serif-accent" style={{ color: '#8A8378' }}>
                  {stat.caption}
                </p>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(138, 131, 120, 0.18)' }} />
        </div>
      </div>
    </section>
  )
}
