'use client'

import { useEffect, useRef, createContext, useContext } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, useReducedMotion } from '@/lib/use-gsap'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      // No smooth scroll, just refresh ScrollTrigger
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    })

    lenisRef.current = lenis

    // Keep the page pinned to the top while the preloader plays.
    // Lenis hijacks wheel events, so body overflow:hidden alone can't stop it.
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    if (!(window as any).__aeroPreloaderDone) {
      lenis.stop()
    }

    const onPreloaderDone = () => {
      lenis.scrollTo(0, { immediate: true })
      lenis.start()
    }
    window.addEventListener('aeropilot:preloader-done', onPreloaderDone)

    // Safety net: never leave scrolling locked for more than 4s
    const failsafe = setTimeout(onPreloaderDone, 4000)

    // Sync Lenis to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // Refresh ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update)

    // Initial refresh after a short delay
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      clearTimeout(timer)
      clearTimeout(failsafe)
      window.removeEventListener('aeropilot:preloader-done', onPreloaderDone)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
