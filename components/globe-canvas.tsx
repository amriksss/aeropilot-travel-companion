'use client'

import dynamic from 'next/dynamic'
import type { AircraftPosition, RouteArc } from '@/lib/flights/types'

const Globe = dynamic(() => import('@/components/three/globe'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Initializing globe...
      </p>
    </div>
  ),
})

export function GlobeCanvas({
  aircraft,
  routes,
  onCityClick,
}: {
  aircraft: AircraftPosition[]
  routes: RouteArc[]
  onCityClick?: (iata: string) => void
}) {
  return (
    <div className="h-full w-full">
      <Globe aircraft={aircraft} routes={routes} onCityClick={onCityClick} />
    </div>
  )
}
