'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const HeroScene = dynamic(() => import('@/components/three/hero-scene'), {
  ssr: false,
})

export function HeroCanvas() {
  return (
    <Suspense fallback={<div className="size-full bg-background" />}>
      <HeroScene />
    </Suspense>
  )
}
