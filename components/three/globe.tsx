'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { AIRPORTS } from '@/lib/flights/airports'
import type { AircraftPosition, RouteArc } from '@/lib/flights/types'

const R = 2
const ORANGE = '#f97316'
const SLATE = '#8b98ab'

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/* ── Textured Earth ─────────────────────────────────────────────── */

function EarthTextured() {
  const [colorMap, bumpMap] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
  ])

  return (
    <group>
      {/* Main globe */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Atmosphere rim glow */}
      <mesh>
        <sphereGeometry args={[R * 1.03, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[R, 64, 64]} />
      <meshStandardMaterial color="#111722" roughness={0.85} metalness={0.15} />
    </mesh>
  )
}

function Earth() {
  return (
    <Suspense fallback={<EarthFallback />}>
      <EarthTextured />
    </Suspense>
  )
}

/* ── Aircraft instanced dots ────────────────────────────────────── */

function AircraftLayer({ aircraft, dimmed }: { aircraft: AircraftPosition[]; dimmed?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const count = aircraft.length

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      const a = aircraft[i]
      const pos = latLonToVec3(a.lat, a.lon, R * 1.015)
      dummy.position.copy(pos)
      dummy.lookAt(0, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.count = count
    mesh.instanceMatrix.needsUpdate = true
  }, [aircraft, count, dummy])

  if (count === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, Math.max(count, 1)]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.008, 6, 6]} />
      <meshBasicMaterial color={ORANGE} transparent opacity={dimmed ? 0.08 : 1} />
    </instancedMesh>
  )
}

/* ── Route arc lines ────────────────────────────────────────────── */

function RouteArcLine({
  arc,
  index,
  highlighted,
}: {
  arc: RouteArc
  index: number
  highlighted?: boolean
}) {
  const matRef = useRef<THREE.LineDashedMaterial>(null)

  const geometry = useMemo(() => {
    const from = latLonToVec3(arc.from.lat, arc.from.lon, R * 1.01)
    const to = latLonToVec3(arc.to.lat, arc.to.lon, R * 1.01)
    const dist = from.distanceTo(to)
    const midA = from.clone().lerp(to, 0.35).normalize().multiplyScalar(R + dist * 0.28)
    const midB = from.clone().lerp(to, 0.65).normalize().multiplyScalar(R + dist * 0.28)
    const curve = new THREE.CubicBezierCurve3(from, midA, midB, to)
    const pts = curve.getPoints(64)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return geo
  }, [arc])

  const lineObj = useMemo(() => {
    const mat = new THREE.LineDashedMaterial({
      color: ORANGE,
      dashSize: highlighted ? 0.12 : 0.09,
      gapSize: highlighted ? 0.03 : 0.05,
      transparent: true,
      opacity: highlighted ? 1 : 0.95,
      linewidth: 1,
    })
    const line = new THREE.Line(geometry, mat)
    line.computeLineDistances()
    return { line, mat }
  }, [geometry, highlighted])

  useEffect(() => {
    matRef.current = lineObj.mat
  }, [lineObj])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.dashSize = (highlighted ? 0.12 : 0.09) + 0.03 * Math.sin(clock.elapsedTime * 2 + index)
    }
  })

  return <primitive object={lineObj.line} />
}

/* ── Pulsing endpoint markers ───────────────────────────────────── */

function PulsingMarker({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + 0.3 * Math.sin(clock.elapsedTime * 3)
      ref.current.scale.setScalar(s)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color={ORANGE} transparent opacity={0.9} />
    </mesh>
  )
}

/* ── City markers ───────────────────────────────────────────────── */

function CityMarkers({
  onCityClick,
  dimmed,
}: {
  onCityClick?: (iata: string) => void
  dimmed?: boolean
}) {
  const markers = useMemo(
    () =>
      AIRPORTS.map((a) => ({
        iata: a.iata,
        pos: latLonToVec3(a.lat, a.lon, R * 1.008),
      })),
    [],
  )

  const handleClick = (iata: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onCityClick?.(iata)
  }

  return (
    <group>
      {markers.map((m) => (
        <mesh
          key={m.iata}
          position={m.pos}
          onClick={onCityClick ? handleClick(m.iata) : undefined}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
          }}
        >
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={SLATE} transparent opacity={dimmed ? 0.08 : 0.9} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Slow auto-rotation ─────────────────────────────────────────── */

function SlowRotate({ children, paused }: { children: React.ReactNode; paused?: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.02
  })
  return <group ref={ref}>{children}</group>
}

/* ── Camera rig: fly-to on route focus ──────────────────────────── */

function routeFocus(arc: RouteArc, radius: number) {
  const from = latLonToVec3(arc.from.lat, arc.from.lon, radius)
  const to = latLonToVec3(arc.to.lat, arc.to.lon, radius)
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize()
  const span = from.distanceTo(to)
  const camDistance = radius + Math.min(Math.max(span * 1.1, 1.2), 3.4)
  return mid.multiplyScalar(camDistance)
}

const DEFAULT_CAM = new THREE.Vector3(0, 1.2, 5.6)

function CameraRig({ routes }: { routes: RouteArc[] }) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null)
  const { camera } = useThree()
  const focused = routes.length > 0
  const targetPos = useMemo(
    () => (focused ? routeFocus(routes[0], R) : DEFAULT_CAM.clone()),
    [focused, routes],
  )
  const isAnimating = useRef(false)
  const prevFocused = useRef(focused)

  // Trigger animation only when focus state changes
  useEffect(() => {
    if (prevFocused.current !== focused) {
      isAnimating.current = true
      prevFocused.current = focused
    }
  }, [focused])

  useFrame(() => {
    if (isAnimating.current) {
      camera.position.lerp(targetPos, 0.05)
      // Stop animating once close enough
      if (camera.position.distanceTo(targetPos) < 0.05) {
        isAnimating.current = false
      }
      if (controlsRef.current) {
        // @ts-expect-error — drei OrbitControls exposes update()
        controlsRef.current.update?.()
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={3.2}
      maxDistance={9}
      rotateSpeed={0.5}
      zoomSpeed={1}
      enableDamping
    />
  )
}

/* ── Main Globe export ──────────────────────────────────────────── */

export default function Globe({
  aircraft,
  routes,
  onCityClick,
}: {
  aircraft: AircraftPosition[]
  routes: RouteArc[]
  onCityClick?: (iata: string) => void
}) {
  const focused = routes.length > 0

  return (
    <Canvas
      camera={{ position: [0, 1.2, 5.6], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#e6ebf2" />
      <SlowRotate paused={focused}>
        <Earth />
        <AircraftLayer aircraft={aircraft} dimmed={focused} />
        {routes.map((arc, i) => (
          <RouteArcLine
            key={`${arc.from.iata}-${arc.to.iata}-${i}`}
            arc={arc}
            index={i}
            highlighted={focused}
          />
        ))}
        {/* Pulsing endpoint markers when focused */}
        {focused &&
          routes.map((arc, i) => (
            <group key={`markers-${i}`}>
              <PulsingMarker position={latLonToVec3(arc.from.lat, arc.from.lon, R * 1.012)} />
              <PulsingMarker position={latLonToVec3(arc.to.lat, arc.to.lon, R * 1.012)} />
            </group>
          ))}
        <CityMarkers onCityClick={onCityClick} dimmed={focused} />
      </SlowRotate>
      <CameraRig routes={routes} />
    </Canvas>
  )
}
