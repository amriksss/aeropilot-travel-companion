'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useReducedMotion } from '@/lib/use-gsap'

const BOOT_LINES = [
  { text: 'INITIALIZING_AEROPILOT...', delay: 0 },
  { text: '[CORE_SYSTEMS] ONLINE', delay: 0.6 },
  { text: '[OPENSKY_FEED] CONNECTED', delay: 1.0 },
  { text: '> "THE WORLD IS A BOOK,', delay: 1.5 },
  { text: '  AND THOSE WHO DO NOT TRAVEL', delay: 1.8 },
  { text: '  READ ONLY ONE PAGE."', delay: 2.1 },
  { text: '', delay: 2.5 },
  { text: 'YOUR AI TRAVEL COMPANION', delay: 2.6 },
]

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [typingIndex, setTypingIndex] = useState(-1)
  const [charCounts, setCharCounts] = useState<Record<number, number>>({})
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current) return

    // Prevent scroll during preloader
    document.body.style.overflow = 'hidden'

    if (reducedMotion) {
      // Instant reveal
      const timer = setTimeout(() => {
        document.body.style.overflow = ''
        setVisible(false)
      }, 500)
      return () => clearTimeout(timer)
    }

    // Type each line sequentially
    const timeouts: ReturnType<typeof setTimeout>[] = []

    BOOT_LINES.forEach((line, i) => {
      // Show line and start typing
      const showTimeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
        setTypingIndex(i)

        // Type characters one by one
        const chars = line.text.length
        for (let c = 0; c <= chars; c++) {
          const charTimeout = setTimeout(() => {
            setCharCounts(prev => ({ ...prev, [i]: c }))
          }, c * 25)
          timeouts.push(charTimeout)
        }
      }, line.delay * 1000)
      timeouts.push(showTimeout)
    })

    // Wipe away after all lines typed
    const wipeTimeout = setTimeout(() => {
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            document.body.style.overflow = ''
            setVisible(false)
          },
        })
      }
    }, 3200)
    timeouts.push(wipeTimeout)

    return () => {
      timeouts.forEach(clearTimeout)
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
      <div className="flex flex-col gap-1 px-8 max-w-lg w-full">
        {BOOT_LINES.map((line, i) => {
          if (!visibleLines.includes(i)) return <div key={i} className="h-5" />

          const displayChars = charCounts[i] ?? 0
          const displayText = line.text.substring(0, displayChars)
          const isLastLine = i === BOOT_LINES.length - 1
          const isActive = isLastLine || line.text.startsWith('>')

          return (
            <div
              key={i}
              className={`preloader-text ${isActive ? 'active' : ''}`}
            >
              {displayText}
              {typingIndex === i && displayChars < line.text.length && (
                <span className="terminal-cursor" />
              )}
            </div>
          )
        })}
      </div>

      {/* Red accent line */}
      <div
        className="absolute bottom-16 left-8 right-8 h-px"
        style={{ background: '#E0201C', opacity: 0.6 }}
      />
      <div className="absolute bottom-8 left-8 micro-label" style={{ color: '#8A8A85' }}>
        v0.1.0 — AEROPILOT
      </div>
    </div>
  )
}
