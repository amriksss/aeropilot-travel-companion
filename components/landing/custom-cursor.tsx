'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const link = el.closest('a, button, [data-cursor-hover]')
      const media = el.closest('[data-cursor-label]')

      if (link) {
        setIsHovering(true)
        setShowLabel(false)
      } else if (media) {
        setIsHovering(true)
        setShowLabel(true)
      } else {
        setIsHovering(false)
        setShowLabel(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    // Lerp animation loop
    let animId: number
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const animate = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.12)
      pos.current.y = lerp(pos.current.y, target.current.y, 0.12)

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${pos.current.x + 20}px, ${pos.current.y - 10}px)`
      }

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animId)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
        aria-hidden="true"
      />
      <div
        ref={labelRef}
        className={`custom-cursor-label ${showLabel ? 'visible' : ''}`}
        aria-hidden="true"
      >
        EXPLORE
      </div>
    </>
  )
}
