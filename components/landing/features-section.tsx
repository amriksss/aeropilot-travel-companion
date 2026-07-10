'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

const FEATURES = [
  {
    id: '01',
    title: 'Live Global\nAir Traffic',
    tags: ['real-time', '3d globe', 'opensky'],
    description:
      'Real aircraft positions streamed from the OpenSky Network, rendered on an interactive golden globe with graceful flight-path arcs.',
    image: '/landing/lux-feature-globe.png',
    href: '/dashboard',
  },
  {
    id: '02',
    title: 'Smart Flight\nSearch',
    tags: ['ai search', '70+ airports', 'pricing'],
    description:
      'Direct and connecting offers across 70+ major world airports with intelligent dynamic pricing and flexible date intelligence.',
    image: '/landing/lux-feature-search.png',
    href: '/dashboard',
  },
  {
    id: '03',
    title: 'AI Travel\nConcierge',
    tags: ['streaming', 'tool calls', 'copilot'],
    description:
      'A streaming chat concierge that searches, compares, and plans flights with live tool calls — your personal travel intelligence engine.',
    image: '/landing/lux-feature-ai.png',
    href: '/chat',
  },
  {
    id: '04',
    title: 'Multi-City\nPlanning',
    tags: ['itineraries', 'per-leg', 'hub routes'],
    description:
      'Sequential itineraries with per-leg offers, automated totals, and plausible hub connections across the global network.',
    image: '/landing/lux-feature-multicity.png',
    href: '/trips',
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current || reducedMotion) return

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.feature-row')

      rows.forEach((row) => {
        const media = row.querySelector('.feature-media')
        const copyItems = row.querySelectorAll('.feature-copy > *')
        const img = row.querySelector('.feature-image')

        // Reveal: image and copy ease in as the row enters the viewport
        gsap.from(media, {
          opacity: 0,
          y: 60,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        })

        gsap.from(copyItems, {
          opacity: 0,
          y: 34,
          duration: 1.1,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: row,
            start: 'top 74%',
            toggleActions: 'play none none none',
          },
        })

        // Gentle parallax on the image while the row moves through the viewport
        if (img) {
          gsap.fromTo(
            img,
            { y: '-6%', scale: 1.08 },
            {
              y: '6%',
              scale: 1.08,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  // Subtle 3D tilt on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const card = e.currentTarget
    const inner = card.querySelector('.tilt-card-inner') as HTMLElement
    if (!inner) return

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    inner.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const inner = card.querySelector('.tilt-card-inner') as HTMLElement
    if (!inner) return
    inner.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  return (
    <section
      ref={sectionRef}
      className="section-dark relative overflow-hidden py-28 md:py-40"
    >
      {/* Section header */}
      <div className="px-6 md:px-12 lg:px-20 flex items-center gap-6 mb-20 md:mb-28">
        <p className="micro-label" style={{ color: '#C9A96A' }}>
          CAPABILITIES
        </p>
        <div className="gold-hairline flex-1 max-w-xs" aria-hidden="true" />
      </div>

      {/* Feature rows */}
      <div className="flex flex-col gap-28 md:gap-44">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.id}
            className="feature-row px-6 md:px-12 lg:px-20"
          >
            <div
              className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center`}
            >
              {/* Media card */}
              <div
                className={`lg:col-span-6 ${
                  i % 2 === 1 ? 'lg:order-2' : ''
                }`}
              >
                <div
                  className="feature-media tilt-card relative max-w-xl mx-auto lg:mx-0"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  data-cursor-label="explore"
                >
                  <div className="tilt-card-inner corner-marks liquid-glass p-3">
                    <div className="aspect-[4/5] md:aspect-[3/4] relative overflow-hidden rounded-sm">
                      <Image
                        src={feature.image}
                        alt={feature.title.replace('\n', ' ')}
                        fill
                        className="feature-image object-cover"
                        style={{ willChange: 'transform' }}
                      />
                      {/* Soft vignette for depth */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(to top, rgba(10,9,8,0.55) 0%, transparent 40%)',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info column */}
              <div
                className={`feature-copy lg:col-span-6 flex flex-col gap-6 md:gap-7 ${
                  i % 2 === 1 ? 'lg:order-1' : ''
                }`}
              >
                {/* Index */}
                <span
                  className="serif-accent text-2xl"
                  style={{ color: '#C9A96A' }}
                >
                  No. {feature.id}
                </span>

                {/* Title */}
                <h3
                  className="whitespace-pre-line text-balance"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.5rem, 4.5vw, 4.75rem)',
                    fontWeight: 500,
                    lineHeight: 1,
                    color: '#F4F1EA',
                  }}
                >
                  {feature.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="glass-pill micro-label"
                      style={{ color: '#C9A96A' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p
                  className="text-base md:text-lg leading-relaxed max-w-md"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: '#F4F1EA',
                    opacity: 0.72,
                    fontWeight: 300,
                  }}
                >
                  {feature.description}
                </p>

                {/* CTA Button */}
                <Link href={feature.href} className="editorial-btn self-start">
                  <span>EXPLORE FEATURE</span>
                  <span className="arrow">↗</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
