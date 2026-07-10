'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register once at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

/**
 * Checks whether the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return reduced
}

/**
 * Splits the text content of a ref into <span class="word-mask"><span>word</span></span>
 * elements for staggered reveal animations. Returns a ref to the split words.
 */
export function useSplitText(containerRef: React.RefObject<HTMLElement | null>) {
  const wordsRef = useRef<HTMLSpanElement[]>([])

  const split = useCallback(() => {
    const el = containerRef.current
    if (!el) return []

    const text = el.textContent || ''
    const words = text.split(/\s+/).filter(Boolean)

    el.innerHTML = ''
    wordsRef.current = []

    words.forEach((word, i) => {
      const mask = document.createElement('span')
      mask.className = 'word-mask'

      const inner = document.createElement('span')
      inner.textContent = word
      inner.style.transform = 'translateY(100%)'

      mask.appendChild(inner)
      el.appendChild(mask)

      // Add space between words
      if (i < words.length - 1) {
        const space = document.createTextNode('\u00A0')
        el.appendChild(space)
      }

      wordsRef.current.push(inner)
    })

    return wordsRef.current
  }, [containerRef])

  return { split, wordsRef }
}

/**
 * Splits the text content of a ref into lines, wrapping each line in
 * <span class="line-mask"><span>line content</span></span>.
 */
export function useSplitLines(containerRef: React.RefObject<HTMLElement | null>) {
  const linesRef = useRef<HTMLSpanElement[]>([])

  const split = useCallback(() => {
    const el = containerRef.current
    if (!el) return []

    const text = el.textContent || ''
    // Split on explicit newlines or <br>
    const lines = text.split(/\n|\//).filter(l => l.trim())

    el.innerHTML = ''
    linesRef.current = []

    lines.forEach((line) => {
      const mask = document.createElement('span')
      mask.className = 'line-mask'

      const inner = document.createElement('span')
      inner.textContent = line.trim()
      inner.style.transform = 'translateY(100%)'

      mask.appendChild(inner)
      el.appendChild(mask)

      linesRef.current.push(inner)
    })

    return linesRef.current
  }, [containerRef])

  return { split, linesRef }
}
