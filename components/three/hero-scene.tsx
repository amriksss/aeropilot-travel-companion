'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GOLD = '#C9A96A'
const GOLD_DIM = '#5b4c2e'
const IVORY = '#F4F1EA'

/** Convert lat/lon (degrees) to a Vector3 on a sphere of radius r */
function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

/** Great-circle-ish arc between two points, lifted above the sphere */
function makeArc(a: THREE.Vector3, b: THREE.Vector3, r: number, segments = 72) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const p = new THREE.Vector3().lerpVectors(a, b, t)
    const lift = 1 + 0.2 * Math.sin(Math.PI * t)
    p.normalize().multiplyScalar(r * lift)
    pts.push(p)
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

// World hubs (lat, lon)
const HUBS: [number, number][] = [
  [40.64, -73.78], // JFK
  [51.47, -0.45], // LHR
  [25.25, 55.36], // DXB
  [35.55, 139.78], // HND
  [1.36, 103.99], // SIN
  [-33.95, 151.18], // SYD
  [48.86, 2.35], // CDG
  [34.05, -118.24], // LAX
  [22.31, 113.91], // HKG
  [-23.43, -46.47], // GRU
  [19.09, 72.87], // BOM
  [41.98, -87.9], // ORD
]

const ROUTES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 4],
  [4, 5],
  [3, 4],
  [0, 7],
  [1, 6],
  [2, 3],
  [8, 3],
  [8, 4],
  [9, 0],
  [10, 2],
  [11, 1],
  [7, 3],
]

/** Radius of the globe — large, so the upper hemisphere spans the viewport */
const R = 3.4

function LuxGlobe() {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useFrame(({ pointer: p, clock }, delta) => {
    pointer.current.x += (p.x - pointer.current.x) * 0.02
    pointer.current.y += (p.y - pointer.current.y) * 0.02
    if (group.current) {
      group.current.rotation.y += delta * 0.04
      group.current.rotation.x = pointer.current.y * 0.06
      group.current.rotation.z = pointer.current.x * 0.02
      group.current.position.y =
        -R * 0.92 + Math.sin(clock.elapsedTime * 0.35) * 0.05
    }
  })

  const { latLines, lonLines, arcs, hubPositions } = useMemo(() => {
    const lat: THREE.BufferGeometry[] = []
    const lon: THREE.BufferGeometry[] = []

    for (let i = -60; i <= 60; i += 20) {
      const phi = (i * Math.PI) / 180
      const r = R * Math.cos(phi)
      const y = R * Math.sin(phi)
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 128; t++) {
        const a = (t / 128) * Math.PI * 2
        pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)))
      }
      lat.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    for (let i = 0; i < 180; i += 20) {
      const theta = (i * Math.PI) / 180
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 128; t++) {
        const a = (t / 128) * Math.PI * 2
        const x = R * Math.sin(a) * Math.cos(theta)
        const z = R * Math.sin(a) * Math.sin(theta)
        const y = R * Math.cos(a)
        pts.push(new THREE.Vector3(x, y, z))
      }
      lon.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    const hubVecs = HUBS.map(([la, lo]) => latLonToVec3(la, lo, R))
    const arcGeos = ROUTES.map(([a, b]) => makeArc(hubVecs[a], hubVecs[b], R))

    return { latLines: lat, lonLines: lon, arcs: arcGeos, hubPositions: hubVecs }
  }, [])

  return (
    <group ref={group} position={[0, -R * 0.92, 0]}>
      {/* Fine graticule */}
      {latLines.map((g, i) => (
        <line key={`lat-${i}`}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={GOLD_DIM} transparent opacity={0.45} />
        </line>
      ))}
      {lonLines.map((g, i) => (
        <line key={`lon-${i}`}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={GOLD_DIM} transparent opacity={0.38} />
        </line>
      ))}

      {/* Golden equator highlight */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.004, 8, 220]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.9} />
      </mesh>

      {/* Flight arcs */}
      {arcs.map((g, i) => (
        <line key={`arc-${i}`}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={GOLD} transparent opacity={0.65} />
        </line>
      ))}

      {/* Hub markers with pulse */}
      <HubMarkers positions={hubPositions} />

      {/* Travelling lights along arcs */}
      <ArcTravellers arcs={arcs} />

      {/* Occluding inner sphere for depth */}
      <mesh>
        <sphereGeometry args={[R - 0.02, 64, 64]} />
        <meshBasicMaterial color="#0A0908" transparent opacity={0.94} />
      </mesh>

      {/* Soft outer halo */}
      <mesh>
        <sphereGeometry args={[R + 0.16, 64, 64]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

/** Ivory hub dots that gently pulse in scale */
function HubMarkers({ positions }: { positions: THREE.Vector3[] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const s = 1 + 0.35 * Math.sin(t * 1.6 + i * 1.1)
      m.scale.setScalar(s)
    })
  })

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={`hub-${i}`} position={p} ref={(el) => { refs.current[i] = el }}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color={IVORY} transparent opacity={0.95} />
        </mesh>
      ))}
    </>
  )
}

/** Small glowing points that travel smoothly along each arc */
function ArcTravellers({ arcs }: { arcs: THREE.BufferGeometry[] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])

  const arcPoints = useMemo(
    () =>
      arcs.map((g) => {
        const pos = g.getAttribute('position') as THREE.BufferAttribute
        const pts: THREE.Vector3[] = []
        for (let i = 0; i < pos.count; i++) {
          pts.push(new THREE.Vector3().fromBufferAttribute(pos, i))
        }
        return pts
      }),
    [arcs]
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    arcPoints.forEach((pts, i) => {
      const mesh = refs.current[i]
      if (!mesh || pts.length === 0) return
      const progress = (t * 0.08 + i * 0.11) % 1
      const idx = Math.min(Math.floor(progress * (pts.length - 1)), pts.length - 2)
      const frac = progress * (pts.length - 1) - idx
      mesh.position.lerpVectors(pts[idx], pts[idx + 1], frac)
    })
  })

  return (
    <>
      {arcPoints.map((_, i) => (
        <mesh key={`traveller-${i}`} ref={(el) => { refs.current[i] = el }}>
          <sphereGeometry args={[0.026, 10, 10]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
      ))}
    </>
  )
}

/** Sparse, slow-drifting champagne dust across the whole viewport */
function GoldDust() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 420
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.003
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={GOLD} transparent opacity={0.4} />
    </points>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.4], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <LuxGlobe />
      <GoldDust />
    </Canvas>
  )
}
