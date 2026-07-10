'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

const LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'AI Concierge', href: '/chat' },
  { label: 'Flight Search', href: '/dashboard' },
  { label: 'My Trips', href: '/trips' },
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
        const lines = ['Begin your', 'journey']

        el.innerHTML = ''
        const lineSpans: HTMLSpanElement[] = []

        lines.forEach((line) => {
          const mask = document.createElement('div')
          mask.className = 'line-mask'

          const inner = document.createElement('span')
          if (line === 'journey') {
            inner.innerHTML =
              '<em class="serif-accent" style="color:#C9A96A">journey</em>'
          } else {
            inner.textContent = line
          }
          inner.style.transform = 'translateY(110%)'

          mask.appendChild(inner)
          el.appendChild(mask)
          lineSpans.push(inner)
        })

        gsap.to(lineSpans, {
          y: 0,
          duration: 1.5,
          stagger: 0.12,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        })
      }

      // Fade in links
      linksRef.current.forEach((link, i) => {
        if (!link) return
        gsap.from(link, {
          opacity: reducedMotion ? 1 : 0,
          x: reducedMotion ? 0 : -24,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: link,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.06,
        })
      })

      // Gentle parallax on image
      if (imageRef.current && !reducedMotion) {
        gsap.fromTo(
          imageRef.current,
          { y: 30 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="section-light relative py-32 md:py-48 overflow-hidden"
    >
      <div className="relative z-10 px-6 md:px-12 lg:px-20">
        {/* Label */}
        <div className="flex items-center gap-6 mb-10">
          <p className="micro-label" style={{ color: '#8A8378' }}>
            AN INVITATION
          </p>
          <div
            className="flex-1 max-w-xs"
            style={{
              height: '1px',
              background:
                'linear-gradient(to right, rgba(201,169,106,0.6), transparent)',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Headline */}
        <h2
          ref={headlineRef}
          className="text-display mb-16 text-balance"
          style={{ color: '#0A0908' }}
        >
          Begin your / journey
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Copy + Links */}
          <div className="lg:col-span-7">
            <p
              className="text-lg md:text-xl leading-relaxed max-w-xl mb-12"
              style={{
                fontFamily: 'var(--font-body)',
                color: '#0A0908',
                opacity: 0.75,
                fontWeight: 300,
              }}
            >
              Your{' '}
              <em className="serif-accent" style={{ color: '#A8863D' }}>
                intelligent
              </em>{' '}
              flight companion awaits. Powered by AI, fueled by real-time data,
              and designed for travelers who demand{' '}
              <em className="serif-accent" style={{ color: '#A8863D' }}>
                more
              </em>
              .
            </p>

            {/* Oversized link list */}
            <div className="liquid-glass liquid-glass--light flex flex-col gap-0 px-6 md:px-8 py-2">
              {LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  ref={(el) => { linksRef.current[i] = el }}
                  href={link.href}
                  className="group flex items-center justify-between py-5 md:py-6"
                  style={{ borderBottom: '1px solid rgba(10, 9, 8, 0.12)' }}
                >
                  <span
                    className="text-3xl md:text-5xl tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: '#0A0908',
                    }}
                  >
                    {link.label}
                  </span>
                  <span
                    className="arrow text-xl md:text-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1"
                    style={{ color: '#A8863D' }}
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </div>

            {/* Email */}
            <div className="mt-12">
              <p className="micro-label mb-2" style={{ color: '#8A8378' }}>
                GET IN TOUCH
              </p>
              <a
                href="mailto:hello@aeropilot.ai"
                className="editorial-link text-base"
                style={{ fontFamily: 'var(--font-body)', color: '#0A0908' }}
              >
                hello@aeropilot.ai
              </a>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/auth/sign-up"
                className="editorial-btn"
                style={{
                  color: '#F4F1EA',
                  background: '#0A0908',
                  borderColor: '#0A0908',
                }}
              >
                <span>CREATE ACCOUNT</span>
                <span className="arrow">↗</span>
              </Link>
            </div>
          </div>

          {/* Right: Editorial image */}
          <div className="lg:col-span-5">
            <div ref={imageRef} className="corner-marks liquid-glass liquid-glass--light p-3">
              <div className="lux-frame rounded-sm overflow-hidden">
                <Image
                  src="/landing/lux-cta.png"
                  alt="Private jet on a runway at night under golden lights"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <p className="micro-label mt-6" style={{ color: '#8A8378' }}>
              DEPART ON YOUR TERMS
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-24 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(10, 9, 8, 0.12)' }}
        >
          <p className="micro-label" style={{ color: '#8A8378' }}>
            AEROPILOT — 2026
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
          >
            Flight offers are simulated. Live positions via OpenSky Network.
          </p>
        </div>
      </div>
    </section>
  )
}
