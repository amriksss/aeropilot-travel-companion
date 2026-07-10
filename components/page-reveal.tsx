'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Wraps app pages with the same silky entrance used on the landing page.
 * Any child element marked with `data-reveal` fades and rises in a stagger.
 */
export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = ref.current.querySelectorAll('[data-reveal]')
    if (reduced || targets.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.09,
          ease: 'power4.out',
          clearProps: 'transform',
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
