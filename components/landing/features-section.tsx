'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

const FEATURES = [
  {
    id: '01',
    title: 'LIVE GLOBAL\nAIR TRAFFIC',
    tags: ['real-time', '3d-globe', 'opensky'],
    description:
      'Real aircraft positions streamed from the OpenSky Network, rendered on an interactive 3D globe with dynamic flight path visualization.',
    image: '/landing/feature-globe.png',
    href: '/dashboard',
  },
  {
    id: '02',
    title: 'SMART FLIGHT\nSEARCH',
    tags: ['ai-search', '70+-airports', 'pricing'],
    description:
      'Direct and connecting offers across 70+ major world airports with intelligent dynamic pricing and flexible date intelligence.',
    image: '/landing/feature-search.png',
    href: '/dashboard',
  },
  {
    id: '03',
    title: 'AI TRAVEL\nCOMPANION',
    tags: ['streaming', 'tool-calls', 'copilot'],
    description:
      'A streaming chat copilot that searches, compares, and plans flights with live tool calls — your personal travel intelligence engine.',
    image: '/landing/feature-ai-chat.png',
    href: '/chat',
  },
  {
    id: '04',
    title: 'MULTI-CITY\nPLANNING',
    tags: ['itineraries', 'per-leg', 'hub-routes'],
    description:
      'Sequential itineraries with per-leg offers, automated totals, and plausible hub connections across the global network.',
    image: '/landing/feature-multicity.png',
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
        // No pin/scrub — just fade in each slide
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

      // Pin the section and scrub through slides
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${window.innerHeight * totalSlides}`,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * totalSlides),
              totalSlides - 1
            )
            setActiveIndex(idx)

            // Update progress bar
            if (progressRef.current) {
              progressRef.current.style.setProperty(
                '--progress',
                String(self.progress)
              )
            }
          },
        },
      })

      // Animate through slides
      for (let i = 0; i < totalSlides; i++) {
        const slide = slides[i] as HTMLElement
        if (!slide) continue

        if (i > 0) {
          tl.fromTo(
            slide,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.5 },
            i
          )
        }

        if (i < totalSlides - 1) {
          tl.to(
            slide,
            { opacity: 0, y: -60, duration: 0.5 },
            i + 0.7
          )
        }

        // Parallax on the image inside the slide
        const img = slide.querySelector('.feature-image')
        if (img) {
          tl.fromTo(
            img,
            { y: '15%', scale: 1.05 },
            { y: '-15%', scale: 1, duration: 1 },
            i
          )
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  // 3D tilt on hover for cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return
    const card = e.currentTarget
    const inner = card.querySelector('.tilt-card-inner') as HTMLElement
    if (!inner) return

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    inner.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const inner = card.querySelector('.tilt-card-inner') as HTMLElement
    if (!inner) return
    inner.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  return (
    <section ref={sectionRef} className="section-dark relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover opacity-[0.03]"
        style={{ backgroundImage: 'url(/landing/feature-globe.png)', filter: 'blur(30px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Top micro-label */}
        <div className="pt-20 px-6 md:px-12 lg:px-20">
          <p className="micro-label" style={{ color: '#8A8A85' }}>
            CAPABILITIES
          </p>
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
              style={reducedMotion ? { position: 'relative', height: 'auto', minHeight: '80vh' } : {}}
            >
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Media card - left */}
                <div className="lg:col-span-7">
                  <div
                    className="tilt-card relative overflow-hidden"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    data-cursor-label="explore"
                  >
                    <div className="tilt-card-inner aspect-[4/5] md:aspect-[3/4] relative overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.title.replace('\n', ' ')}
                        fill
                        className="feature-image object-cover"
                        style={{ willChange: 'transform' }}
                      />
                    </div>

                    {/* Giant overlapping title */}
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 z-20">
                      <h3
                        className="font-bold leading-[0.85] uppercase whitespace-pre-line"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(2.5rem, 7vw, 7rem)',
                          color: '#E8E6E1',
                          textShadow: '0 2px 40px rgba(0,0,0,0.6)',
                        }}
                      >
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Info column - right */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-3">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="micro-label pb-1"
                        style={{
                          color: '#8A8A85',
                          borderBottom: '1px solid rgba(138, 138, 133, 0.4)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p
                    className="text-base md:text-lg leading-relaxed"
                    style={{ fontFamily: 'var(--font-body)', color: '#E8E6E1', opacity: 0.8 }}
                  >
                    {feature.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={feature.href}
                    className="editorial-btn self-start"
                    style={{ color: '#E8E6E1', borderColor: 'rgba(232, 230, 225, 0.4)' }}
                  >
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
            style={{ color: '#8A8A85', fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            [ {String(activeIndex + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')} ]
          </span>

          <div ref={progressRef} className="scroll-progress-bar flex-1" />
        </div>
      </div>
    </section>
  )
}
