'use client'

import { useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'

function ScrambleLink({ href, children }: { href: string; children: string }) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const originalText = children
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = useCallback(() => {
    if (!spanRef.current || animRef.current) return

    let iteration = 0
    const text = originalText

    animRef.current = setInterval(() => {
      if (!spanRef.current) {
        if (animRef.current) clearInterval(animRef.current)
        animRef.current = null
        return
      }

      spanRef.current.textContent = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return text[i]
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        })
        .join('')

      iteration += 1 / 2

      if (iteration >= text.length) {
        if (animRef.current) clearInterval(animRef.current)
        animRef.current = null
        if (spanRef.current) spanRef.current.textContent = text
      }
    }, 30)
  }, [originalText])

  const reset = useCallback(() => {
    if (animRef.current) {
      clearInterval(animRef.current)
      animRef.current = null
    }
    if (spanRef.current) spanRef.current.textContent = originalText
  }, [originalText])

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [])

  return (
    <Link
      href={href}
      className="editorial-link hud-bar"
      style={{ pointerEvents: 'auto' }}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      <span ref={spanRef}>{children}</span>
    </Link>
  )
}

export function HudFrame() {
  return (
    <div className="hud-frame" aria-hidden="false">
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid rgba(201, 169, 106, 0.18)' }}
      >
        <span className="hud-bar">MMXXVI</span>
        <span className="hud-bar" style={{ color: '#C9A96A' }}>PRIVATE FLIGHT INTELLIGENCE</span>
        <span className="hud-bar">AEROPILOT</span>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid rgba(201, 169, 106, 0.18)' }}
      >
        <span className="hud-bar">v0.1.0</span>
        <nav className="flex items-center gap-6" style={{ pointerEvents: 'auto' }}>
          <ScrambleLink href="/dashboard">DASHBOARD</ScrambleLink>
          <ScrambleLink href="/chat">AI COMPANION</ScrambleLink>
          <ScrambleLink href="/trips">TRIPS</ScrambleLink>
        </nav>
        <div className="flex items-center gap-4" style={{ pointerEvents: 'auto' }}>
          <Link href="/auth/sign-up" className="editorial-link hud-bar" style={{ pointerEvents: 'auto' }}>
            SIGN UP
          </Link>
        </div>
      </div>

      {/* Left vertical text */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:block">
        <span className="hud-vertical hud-vertical-left">
          ELEVATED · REFINED · EFFORTLESS
        </span>
      </div>

      {/* Right vertical text */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:block">
        <span className="hud-vertical">
          OPENSKY NETWORK — LIVE DATA
        </span>
      </div>
    </div>
  )
}
