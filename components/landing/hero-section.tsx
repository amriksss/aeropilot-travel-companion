'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const ellipseRef = useRef<SVGEllipseElement>(null)
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const circlePos = useRef({ x: 0, y: 0 })
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!headlineRef.current || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // --- SPLIT HEADLINE INTO LINES ---
      const el = headlineRef.current!
      const lines = ['EXPLORE THE', 'WORLD SMARTER']

      el.innerHTML = ''
      const lineSpans: HTMLSpanElement[] = []

      lines.forEach((line) => {
        const mask = document.createElement('div')
        mask.className = 'line-mask'

        const inner = document.createElement('span')
        // Check if this line contains "SMARTER"
        if (line.includes('SMARTER')) {
          inner.innerHTML = 'WORLD <span class="relative inline-block"><span class="smarter-word">SMARTER</span><svg class="absolute -inset-x-4 -inset-y-2 w-[calc(100%+2rem)] h-[calc(100%+1rem)]" viewBox="0 0 300 100" fill="none" aria-hidden="true"><ellipse cx="150" cy="50" rx="140" ry="42" stroke="#E0201C" stroke-width="2.5" stroke-linecap="round" style="stroke-dasharray:900;stroke-dashoffset:900" class="svg-ellipse" /></svg></span>'
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
        // Animate lines in with stagger
        gsap.to(lineSpans, {
          y: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power4.out',
          delay: 3.4, // After preloader
        })

        // Animate the SVG ellipse draw-on
        const ellipse = el.querySelector('.svg-ellipse')
        if (ellipse) {
          gsap.to(ellipse, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            delay: 4.2,
          })
        }

        // Animate paragraph
        if (paragraphRef.current) {
          gsap.from(paragraphRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
            delay: 4.0,
          })
        }

        // Animate label
        if (labelRef.current) {
          gsap.from(labelRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            delay: 3.2,
          })
        }

        // Animate CTA
        if (ctaRef.current) {
          gsap.from(ctaRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power3.out',
            delay: 4.4,
          })
        }
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  // Cursor-following parallax for circular image
  useEffect(() => {
    if (reducedMotion) return

    const handleMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    let animId: number
    const animate = () => {
      const lerp = (s: number, e: number, f: number) => s + (e - s) * f
      const section = sectionRef.current
      if (section) {
        const rect = section.getBoundingClientRect()
        const cx = rect.width / 2
        const cy = rect.height / 2
        const dx = (mouse.current.x - cx) * 0.04
        const dy = (mouse.current.y - cy) * 0.04

        circlePos.current.x = lerp(circlePos.current.x, dx, 0.06)
        circlePos.current.y = lerp(circlePos.current.y, dy, 0.06)

        if (circleRef.current) {
          circleRef.current.style.transform = `translate(${circlePos.current.x}px, ${circlePos.current.y}px)`
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animId)
    }
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="section-light relative min-h-screen flex items-center overflow-hidden">
      {/* Dot matrix texture */}
      <div className="absolute inset-0 dot-matrix" aria-hidden="true" />

      {/* Floating circular image */}
      <div
        ref={circleRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
        aria-hidden="true"
        style={{ willChange: 'transform' }}
      >
        <div className="w-[240px] h-[240px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden opacity-80">
          <Image
            src="/landing/hero-globe.png"
            alt=""
            width={420}
            height={420}
            className="w-full h-full object-cover grayscale"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full px-6 md:px-12 lg:px-20 py-32">
        <p
          ref={labelRef}
          className="micro-label mb-6"
          style={{ color: '#8A8A85' }}
        >
          AI-POWERED FLIGHT INTELLIGENCE
        </p>

        <h1
          ref={headlineRef}
          className="text-display relative"
          style={{ color: '#0C0C0C' }}
        >
          EXPLORE THE / WORLD SMARTER
        </h1>

        <div className="mt-12 max-w-lg ml-0 md:ml-[10%]">
          <p
            ref={paragraphRef}
            className="text-base md:text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: '#0C0C0C', opacity: 0.75 }}
          >
            Search flights, track live air traffic on a 3D globe, and plan
            complex trips with a streaming AI copilot that{' '}
            <em className="serif-accent" style={{ color: '#E0201C' }}>knows your preferences</em>.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth/sign-up"
              className="editorial-btn"
              style={{ color: '#E8E6E1', background: '#E0201C', borderColor: '#E0201C' }}
            >
              <span>GET STARTED</span>
              <span className="arrow">↗</span>
            </Link>
            <Link
              href="/dashboard"
              className="editorial-btn"
              style={{ color: '#0C0C0C', borderColor: '#0C0C0C' }}
            >
              <span>OPEN DASHBOARD</span>
              <span className="arrow">↗</span>
            </Link>
          </div>
        </div>

        {/* Bottom-left metadata */}
        <div
          className="absolute bottom-8 left-6 md:left-12 lg:left-20 micro-label"
          style={{ color: '#8A8A85' }}
        >
          LIVE DATA · OPENSKY NETWORK · 70+ AIRPORTS
        </div>
      </div>
    </section>
  )
}
