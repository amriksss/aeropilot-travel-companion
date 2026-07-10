'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

const WORD = 'AEROPILOT'

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const routeRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const planeRef = useRef<SVGGElement>(null)
  const [visible, setVisible] = useState(true)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current) return

    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)

    const finish = () => {
      document.body.style.overflow = ''
      window.scrollTo(0, 0)
      ;(window as any).__aeroPreloaderDone = true
      window.dispatchEvent(new Event('aeropilot:preloader-done'))
      setVisible(false)
    }

    if (reducedMotion) {
      const timer = setTimeout(finish, 400)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish })

      // 1. Split-flap letters cascade in like a departure board
      const letters = boardRef.current?.querySelectorAll('.preloader-letter')
      if (letters) {
        tl.fromTo(
          letters,
          { rotationX: -90, opacity: 0, y: 12 },
          {
            rotationX: 0,
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.055,
            ease: 'back.out(1.6)',
          },
          0
        )
      }

      // 2. Flight path draws itself while the jet flies along it
      const path = pathRef.current
      const plane = planeRef.current
      if (path && plane) {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.set(plane, { opacity: 0 })

        tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.35)

        const progress = { t: 0 }
        tl.to(plane, { opacity: 1, duration: 0.2 }, 0.4)
        tl.to(
          progress,
          {
            t: 1,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
              const pt = path.getPointAtLength(progress.t * length)
              const ahead = path.getPointAtLength(
                Math.min(progress.t * length + 1, length)
              )
              const angle =
                (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI
              plane.setAttribute(
                'transform',
                `translate(${pt.x}, ${pt.y}) rotate(${angle})`
              )
            },
          },
          0.35
        )
      }

      // 3. Boarding strip types in
      tl.fromTo(
        routeRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.8
      )

      tl.fromTo(
        subRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        1.0
      )

      // 4. Gold progress line fills
      tl.fromTo(
        lineRef.current,
        { '--progress': 0 },
        { '--progress': 1, duration: 1.5, ease: 'power2.inOut' },
        0.4
      )

      // 5. Everything lifts away as the curtain wipes up
      tl.to(
        [boardRef.current, svgRef.current, routeRef.current, subRef.current, lineRef.current],
        { y: -50, opacity: 0, duration: 0.7, ease: 'power3.in' },
        2.15
      )

      tl.to(
        containerRef.current,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.0,
          ease: 'power4.inOut',
        },
        2.3
      )
    }, containerRef)

    return () => {
      ctx.revert()
      document.body.style.overflow = ''
    }
  }, [reducedMotion])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="preloader"
      style={{ clipPath: 'inset(0 0 0 0)' }}
      aria-hidden="true"
    >
      {/* Flight path with jet */}
      <svg
        ref={svgRef}
        width="360"
        height="90"
        viewBox="0 0 360 90"
        fill="none"
        className="mb-2"
      >
        <path
          ref={pathRef}
          d="M 16 74 Q 180 -14 344 74"
          stroke="rgba(201, 169, 106, 0.6)"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />
        {/* Departure + arrival markers */}
        <circle cx="16" cy="74" r="3" fill="#C9A96A" />
        <circle cx="344" cy="74" r="3" fill="none" stroke="#C9A96A" strokeWidth="1" />
        {/* Jet glyph */}
        <g ref={planeRef}>
          <path
            d="M 10 0 L -6 -5 L -3 0 L -6 5 Z"
            fill="#F4F1EA"
          />
        </g>
      </svg>

      {/* Split-flap wordmark */}
      <div ref={boardRef} className="preloader-board">
        {WORD.split('').map((ch, i) => (
          <span key={i} className="preloader-letter">
            {ch}
          </span>
        ))}
      </div>

      <div ref={lineRef} className="preloader-line" />

      {/* Boarding strip */}
      <div ref={routeRef} className="preloader-route">
        NOW BOARDING · FLIGHT AP26 · GATE 01
      </div>

      <div ref={subRef} className="preloader-sub">
        Private Flight Intelligence
      </div>
    </div>
  )
}
