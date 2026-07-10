'use client'

import { useEffect, useRef, useState } from 'react'
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
  const slidesContainerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current || !slidesContainerRef.current) return

    const ctx = gsap.context(() => {
      const totalSlides = FEATURES.length
      const slides = slidesContainerRef.current!.children

      if (reducedMotion) {
        Array.from(slides).forEach((slide) => {
          gsap.from(slide, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            scrollTrigger: {
              trigger: slide as Element,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })
        })
        return
      }

      // Pin the section and scrub through slides — higher scrub value for silkier catch-up
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.8,
          start: 'top top',
          end: () => `+=${window.innerHeight * totalSlides}`,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * totalSlides),
              totalSlides - 1
            )
            setActiveIndex(idx)

            if (progressRef.current) {
              progressRef.current.style.setProperty(
                '--progress',
                String(self.progress)
              )
            }
          },
        },
      })

      for (let i = 0; i < totalSlides; i++) {
        const slide = slides[i] as HTMLElement
        if (!slide) continue

        if (i > 0) {
          tl.fromTo(
            slide,
            { opacity: 0, y: 50, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out' },
            i
          )
        }

        if (i < totalSlides - 1) {
          tl.to(
            slide,
            { opacity: 0, y: -50, scale: 0.985, duration: 0.55, ease: 'power2.in' },
            i + 0.72
          )
        }

        // Gentle parallax on the image inside the slide
        const img = slide.querySelector('.feature-image')
        if (img) {
          tl.fromTo(
            img,
            { y: '10%', scale: 1.06 },
            { y: '-10%', scale: 1, duration: 1, ease: 'none' },
            i
          )
        }
      }
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
      className="section-dark relative overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top micro-label */}
        <div className="pt-20 px-6 md:px-12 lg:px-20 flex items-center gap-6">
          <p className="micro-label" style={{ color: '#C9A96A' }}>
            CAPABILITIES
          </p>
          <div className="gold-hairline flex-1 max-w-xs" aria-hidden="true" />
        </div>

        {/* Slides container */}
        <div ref={slidesContainerRef} className="flex-1 relative">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              className={`absolute inset-0 flex items-center px-6 md:px-12 lg:px-20 ${
                reducedMotion
                  ? 'relative position-static mb-24'
                  : i === 0
                  ? ''
                  : 'opacity-0'
              }`}
              style={
                reducedMotion
                  ? { position: 'relative', height: 'auto', minHeight: '80vh' }
                  : {}
              }
            >
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                {/* Media card - left */}
                <div className="lg:col-span-6">
                  <div
                    className="tilt-card relative"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    data-cursor-label="explore"
                  >
                    <div className="tilt-card-inner corner-marks">
                      <div className="aspect-[4/5] md:aspect-[3/4] relative overflow-hidden">
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

                {/* Info column - right */}
                <div className="lg:col-span-6 flex flex-col gap-7">
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
                      fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
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
                        className="micro-label pb-1"
                        style={{
                          color: '#8A8378',
                          borderBottom: '1px solid rgba(201, 169, 106, 0.35)',
                        }}
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

        {/* Bottom: counter + progress */}
        <div className="px-6 md:px-12 lg:px-20 pb-8 flex items-center gap-6">
          <span
            className="micro-label"
            style={{ color: '#8A8378' }}
          >
            {String(activeIndex + 1).padStart(2, '0')} — {String(FEATURES.length).padStart(2, '0')}
          </span>

          <div ref={progressRef} className="scroll-progress-bar flex-1" />
        </div>
      </div>
    </section>
  )
}
