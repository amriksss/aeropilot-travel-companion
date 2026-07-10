'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

const HeroScene = dynamic(() => import('@/components/three/hero-scene'), {
  ssr: false,
})

// Silky custom eases
const EASE = 'power3.out'
const REVEAL_DELAY = 2.1 // after the refined preloader

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const hairlineRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!headlineRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const el = headlineRef.current!
      const lines = [
        'Travel in a',
        'higher class of',
        'intelligence',
      ]

      el.innerHTML = ''
      const lineSpans: HTMLSpanElement[] = []

      lines.forEach((line) => {
        const mask = document.createElement('div')
        mask.className = 'line-mask'

        const inner = document.createElement('span')
        if (line.includes('intelligence')) {
          inner.innerHTML =
            '<em class="serif-accent" style="color:#C9A96A">intelligence</em>'
        } else {
          inner.textContent = line
        }

        if (!reducedMotion) {
          inner.style.transform = 'translateY(110%)'
        }

        mask.appendChild(inner)
        el.appendChild(mask)
        lineSpans.push(inner)
      })

      if (!reducedMotion) {
        const tl = gsap.timeline({ delay: REVEAL_DELAY })

        tl.to(lineSpans, {
          y: 0,
          duration: 1.6,
          stagger: 0.14,
          ease: 'power4.out',
        })

        if (labelRef.current) {
          tl.from(
            labelRef.current,
            { opacity: 0, y: 14, duration: 1, ease: EASE },
            0.1
          )
        }

        if (hairlineRef.current) {
          tl.fromTo(
            hairlineRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.4, ease: 'power4.inOut' },
            0.3
          )
        }

        if (paragraphRef.current) {
          tl.from(
            paragraphRef.current,
            { opacity: 0, y: 22, duration: 1.2, ease: EASE },
            0.7
          )
        }

        if (ctaRef.current) {
          tl.from(
            ctaRef.current.children,
            { opacity: 0, y: 18, duration: 1, stagger: 0.1, ease: EASE },
            0.95
          )
        }

        if (globeRef.current) {
          tl.from(
            globeRef.current,
            { opacity: 0, scale: 0.94, duration: 2, ease: EASE },
            0.2
          )
        }

        if (cardRef.current) {
          tl.from(
            cardRef.current,
            { opacity: 0, y: 30, duration: 1.4, ease: EASE },
            1.1
          )
        }

        if (metaRef.current) {
          tl.from(
            metaRef.current,
            { opacity: 0, duration: 1.2, ease: EASE },
            1.3
          )
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="section-dark relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Clean radial glow behind the globe — the only background treatment */}
      <div
        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(201,169,106,0.07) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-12 lg:px-20 py-28 lg:py-24">
        {/* Left — copy */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <p ref={labelRef} className="micro-label mb-8 text-champagne">
            AI-POWERED FLIGHT INTELLIGENCE
          </p>

          <h1
            ref={headlineRef}
            className="text-display text-balance"
            style={{ color: '#F4F1EA' }}
          >
            Travel in a / higher class of / intelligence
          </h1>

          <div
            ref={hairlineRef}
            className="gold-hairline mt-10 max-w-md origin-left"
            aria-hidden="true"
          />

          <p
            ref={paragraphRef}
            className="mt-8 max-w-md text-base md:text-lg leading-relaxed"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#F4F1EA',
              opacity: 0.7,
              fontWeight: 300,
            }}
          >
            Search flights, follow live air traffic across a golden globe, and
            plan complex journeys with a streaming AI concierge that{' '}
            <em className="serif-accent" style={{ color: '#C9A96A' }}>
              knows your preferences
            </em>
            .
          </p>

          <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/auth/sign-up" className="editorial-btn editorial-btn--solid">
              <span>BEGIN YOUR JOURNEY</span>
              <span className="arrow">↗</span>
            </Link>
            <Link href="/dashboard" className="editorial-btn">
              <span>OPEN DASHBOARD</span>
              <span className="arrow">↗</span>
            </Link>
          </div>

          <div
            ref={metaRef}
            className="mt-14 micro-label"
            style={{ color: '#8A8378' }}
          >
            LIVE DATA · OPENSKY NETWORK · 70+ AIRPORTS
          </div>
        </div>

        {/* Right — 3D globe + luxury image card */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div
            ref={globeRef}
            className="relative w-full aspect-square max-w-[380px] md:max-w-[520px] lg:max-w-[620px]"
            aria-hidden="true"
          >
            <HeroScene />
          </div>

          {/* Floating editorial image card */}
          <div
            ref={cardRef}
            className="hidden md:block absolute -bottom-4 lg:bottom-8 left-2 lg:-left-6 w-40 lg:w-52"
          >
            <div className="corner-marks">
              <div className="lux-frame">
                <Image
                  src="/landing/lux-hero.png"
                  alt="View from a private jet window at golden hour"
                  width={320}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
            <p className="micro-label mt-4" style={{ color: '#8A8378' }}>
              FIRST CLASS · EVERY FLIGHT
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}
