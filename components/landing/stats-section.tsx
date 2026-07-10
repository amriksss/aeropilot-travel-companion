'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

const STATS = [
  { number: 70, suffix: '+', label: 'AIRPORTS WORLDWIDE', caption: 'Global Coverage' },
  { number: 500, suffix: 'K+', label: 'DAILY FLIGHTS TRACKED', caption: 'OpenSky Network' },
  { number: 6, suffix: '', label: 'SMART TOOLS', caption: 'AI-Powered Intelligence' },
  { number: 24, suffix: '/7', label: 'REAL-TIME DATA', caption: 'Live Streaming' },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate each row
      rowRefs.current.forEach((row, i) => {
        if (!row) return

        if (!reducedMotion) {
          gsap.from(row, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          })
        }

        // Count up numbers
        const numEl = numberRefs.current[i]
        if (!numEl) return

        const target = STATS[i].number
        const obj = { val: 0 }

        ScrollTrigger.create({
          trigger: row,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: reducedMotion ? 0 : 1.5,
              ease: 'power2.out',
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
    <section ref={sectionRef} className="section-dark relative py-32 md:py-48 overflow-hidden">
      {/* Faint background image */}
      <div
        className="absolute inset-0 bg-center bg-cover opacity-[0.04]"
        style={{ backgroundImage: 'url(/landing/feature-globe.png)', filter: 'blur(20px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        <p className="micro-label mb-16 text-center" style={{ color: '#8A8A85' }}>
          BY THE NUMBERS
        </p>

        <div className="flex flex-col">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              ref={el => { rowRefs.current[i] = el }}
              className="py-10 md:py-14 flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8"
              style={{ borderTop: '1px solid rgba(138, 138, 133, 0.2)' }}
            >
              {/* Number + suffix */}
              <div className="flex items-baseline gap-1 md:w-48 flex-shrink-0">
                <span
                  ref={el => { numberRefs.current[i] = el }}
                  className="text-display-sm"
                  style={{ color: '#E8E6E1', fontFamily: 'var(--font-display)' }}
                >
                  0
                </span>
                <span
                  className="text-2xl md:text-4xl font-bold"
                  style={{ color: '#E0201C', fontFamily: 'var(--font-display)' }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className="text-lg md:text-xl font-bold tracking-wide uppercase"
                  style={{ fontFamily: 'var(--font-body)', color: '#E8E6E1' }}
                >
                  {stat.label}
                </p>
                <p
                  className="mt-1 text-base serif-accent"
                  style={{ color: '#8A8A85' }}
                >
                  {stat.caption}
                </p>
              </div>
            </div>
          ))}

          {/* Bottom border */}
          <div style={{ borderTop: '1px solid rgba(138, 138, 133, 0.2)' }} />
        </div>
      </div>
    </section>
  )
}
