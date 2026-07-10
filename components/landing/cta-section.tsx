'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

const LINKS = [
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'AI COMPANION', href: '/chat' },
  { label: 'FLIGHT SEARCH', href: '/dashboard' },
  { label: 'MY TRIPS', href: '/trips' },
]

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([])
  const imageRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Headline reveal
      if (headlineRef.current && !reducedMotion) {
        const el = headlineRef.current
        const lines = ['START YOUR', 'JOURNEY']

        el.innerHTML = ''
        const lineSpans: HTMLSpanElement[] = []

        lines.forEach((line) => {
          const mask = document.createElement('div')
          mask.className = 'line-mask'

          const inner = document.createElement('span')
          inner.textContent = line
          inner.style.transform = 'translateY(110%)'

          mask.appendChild(inner)
          el.appendChild(mask)
          lineSpans.push(inner)
        })

        gsap.to(lineSpans, {
          y: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none none',
          },
        })
      }

      // Fade in links
      linksRef.current.forEach((link, i) => {
        if (!link) return
        gsap.from(link, {
          opacity: reducedMotion ? 1 : 0,
          x: reducedMotion ? 0 : -30,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: link,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.08,
        })
      })

      // Parallax on image
      if (imageRef.current && !reducedMotion) {
        gsap.fromTo(
          imageRef.current,
          { y: 40 },
          {
            y: -40,
            ease: 'none',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="section-light relative py-32 md:py-48 overflow-hidden">
      {/* Dot matrix */}
      <div className="absolute inset-0 dot-matrix" aria-hidden="true" />

      <div className="relative z-10 px-6 md:px-12 lg:px-20">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-display mb-16"
          style={{ color: '#0C0C0C' }}
        >
          START YOUR / JOURNEY
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Copy + Links */}
          <div className="lg:col-span-7">
            <p
              className="text-lg md:text-xl leading-relaxed max-w-xl mb-12"
              style={{ fontFamily: 'var(--font-body)', color: '#0C0C0C', opacity: 0.75 }}
            >
              Your <em className="serif-accent" style={{ color: '#E0201C' }}>intelligent</em> flight
              companion awaits. Powered by AI, fueled by real-time data, and designed
              for travelers who demand{' '}
              <em className="serif-accent" style={{ color: '#E0201C' }}>more</em>.
            </p>

            {/* Oversized link list */}
            <div className="flex flex-col gap-0">
              {LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  ref={el => { linksRef.current[i] = el }}
                  href={link.href}
                  className="group flex items-center justify-between py-5 md:py-6 transition-colors"
                  style={{ borderBottom: '1px solid rgba(12, 12, 12, 0.12)' }}
                >
                  <span
                    className="text-2xl md:text-4xl font-bold uppercase tracking-tight transition-transform group-hover:translate-x-3"
                    style={{ fontFamily: 'var(--font-display)', color: '#0C0C0C' }}
                  >
                    {link.label}
                  </span>
                  <span
                    className="arrow text-xl md:text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    style={{ color: '#E0201C' }}
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </div>

            {/* Email */}
            <div className="mt-12">
              <p className="micro-label mb-2" style={{ color: '#8A8A85' }}>
                GET IN TOUCH
              </p>
              <a
                href="mailto:hello@aeropilot.ai"
                className="editorial-link text-base"
                style={{ fontFamily: 'var(--font-body)', color: '#0C0C0C' }}
              >
                hello@aeropilot.ai
              </a>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/auth/sign-up"
                className="editorial-btn"
                style={{ color: '#E8E6E1', background: '#E0201C', borderColor: '#E0201C' }}
              >
                <span>CREATE ACCOUNT</span>
                <span className="arrow">↗</span>
              </Link>
            </div>
          </div>

          {/* Right: Editorial image */}
          <div className="lg:col-span-5">
            <div ref={imageRef} className="corner-marks">
              <div className="overflow-hidden">
                <Image
                  src="/landing/cta-editorial.png"
                  alt="Airplane wing view — editorial"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-[filter] duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-24 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(12, 12, 12, 0.12)' }}
        >
          <p className="micro-label" style={{ color: '#8A8A85' }}>
            AEROPILOT — 2026
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: 'var(--font-body)', color: '#8A8A85' }}
          >
            Flight offers are simulated. Live positions via OpenSky Network.
          </p>
        </div>
      </div>
    </section>
  )
}
