'use client'

import { useEffect, useRef } from 'react'

interface AeropilotLogoProps {
  size?: 'sm' | 'lg'
  light?: boolean
  showText?: boolean
  className?: string
}

export function AeropilotLogo({
  size = 'sm',
  light = false,
  showText = true,
  className = '',
}: AeropilotLogoProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const crossRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Draw-on animation
    const paths = [pathRef.current, crossRef.current].filter(Boolean) as SVGPathElement[]
    paths.forEach((path) => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)

      requestAnimationFrame(() => {
        path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
        path.style.strokeDashoffset = '0'
      })
    })
  }, [])

  const dim = size === 'lg' ? 40 : 20
  const strokeColor = light ? '#0C0C0C' : '#E0201C'
  const textColor = light ? '#0C0C0C' : '#E8E6E1'

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Geometric "A" shape — compass-inspired */}
        <path
          ref={pathRef}
          d="M20 4L6 36H14L17 28H23L26 36H34L20 4Z M20 12L24.5 24H15.5L20 12Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Compass cross */}
        <path
          ref={crossRef}
          d="M20 0V8 M20 32V40 M0 20H8 M32 20H40"
          stroke={strokeColor}
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      {showText && (
        <span
          className="font-bold uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size === 'lg' ? '1.25rem' : '0.75rem',
            color: textColor,
            letterSpacing: '0.15em',
          }}
        >
          AEROPILOT
        </span>
      )}
    </span>
  )
}
