'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
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
      const tl = gsap.timeline({
        onComplete: finish,
      })

      // Wordmark fades up softly
      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, y: 24, letterSpacing: '0.6em' },
        {
          opacity: 1,
          y: 0,
          letterSpacing: '0.35em',
          duration: 1.1,
          ease: 'power3.out',
        }
      )

      // Sub-label follows
      tl.fromTo(
        subRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.5
      )

      // Gold progress line fills
      tl.fromTo(
        lineRef.current,
        { '--progress': 0 },
        { '--progress': 1, duration: 1.2, ease: 'power2.inOut' },
        0.4
      )

      // Elegant upward wipe
      tl.to(
        containerRef.current,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'power4.inOut',
        },
        1.7
      )

      // Content slides up slightly as the curtain lifts
      tl.to(
        [wordmarkRef.current, subRef.current, lineRef.current],
        { y: -40, opacity: 0, duration: 0.8, ease: 'power3.in' },
        1.6
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
      <div ref={wordmarkRef} className="preloader-wordmark">
        AeroPilot
      </div>
      <div ref={lineRef} className="preloader-line" />
      <div ref={subRef} className="preloader-sub">
        Private Flight Intelligence
      </div>
    </div>
  )
}
