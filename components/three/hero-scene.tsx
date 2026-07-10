'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ORANGE = '#f97316'
const ORANGE_DIM = '#7c3a10'

function WireGlobe() {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useFrame(({ pointer: p }, delta) => {
    pointer.current.x += (p.x - pointer.current.x) * 0.05
    pointer.current.y += (p.y - pointer.current.y) * 0.05
    if (group.current) {
      group.current.rotation.y += delta * 0.08
      group.current.rotation.x = pointer.current.y * 0.15
      group.current.rotation.z = pointer.current.x * 0.05
    }
  })

  const { latLines, lonLines } = useMemo(() => {
    const R = 2
    const lat: THREE.BufferGeometry[] = []
    const lon: THREE.BufferGeometry[] = []
    // latitude rings
    for (let i = -75; i <= 75; i += 15) {
      const phi = (i * Math.PI) / 180
      const r = R * Math.cos(phi)
      const y = R * Math.sin(phi)
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 96; t++) {
        const a = (t / 96) * Math.PI * 2
        pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)))
      }
      lat.push(new THREE.BufferGeometry().setFromPoints(pts))
    }
    // longitude rings
    for (let i = 0; i < 180; i += 15) {
      const theta = (i * Math.PI) / 180
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 96; t++) {
        const a = (t / 96) * Math.PI * 2
        const x = R * Math.sin(a) * Math.cos(theta)
        const z = R * Math.sin(a) * Math.sin(theta)
        const y = R * Math.cos(a)
        pts.push(new THREE.Vector3(x, y, z))
      }
      lon.push(new THREE.BufferGeometry().setFromPoints(pts))
    }
    return { latLines: lat, lonLines: lon }
  }, [])

  return (
    <group ref={group}>
      {latLines.map((g, i) => (
        <line key={`lat-${i}`}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial
            color={i === 5 ? ORANGE : ORANGE_DIM}
            transparent
            opacity={i === 5 ? 0.9 : 0.35}
          />
        </line>
      ))}
      {lonLines.map((g, i) => (
        <line key={`lon-${i}`}>
          <primitive object={g} attach="geometry" />
          <lineBasicMaterial color={ORANGE_DIM} transparent opacity={0.3} />
        </line>
      ))}
      <mesh>
        <sphereGeometry args={[1.97, 48, 48]} />
        <meshBasicMaterial color="#0a0e14" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function Stars() {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const n = 700
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
    if (ref.current) ref.current.rotation.y += delta * 0.008
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#8b98ab" transparent opacity={0.7} />
    </points>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.4], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <WireGlobe />
      <Stars />
    </Canvas>
  )
}
