'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { LiveBadge } from '@/components/live-badge'
import { AeropilotLogo } from '@/components/aeropilot-logo'

const NAV = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/chat', label: 'AI COMPANION' },
  { href: '/trips', label: 'TRIPS' },
  { href: '/preferences', label: 'PREFERENCES' },
]

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function ScrambleNavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = useCallback(() => {
    if (!spanRef.current || animRef.current) return
    let iteration = 0
    animRef.current = setInterval(() => {
      if (!spanRef.current) {
        if (animRef.current) clearInterval(animRef.current)
        animRef.current = null
        return
      }
      spanRef.current.textContent = label
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < iteration) return label[i]
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        })
        .join('')
      iteration += 0.5
      if (iteration >= label.length) {
        if (animRef.current) clearInterval(animRef.current)
        animRef.current = null
        if (spanRef.current) spanRef.current.textContent = label
      }
    }, 30)
  }, [label])

  const reset = useCallback(() => {
    if (animRef.current) {
      clearInterval(animRef.current)
      animRef.current = null
    }
    if (spanRef.current) spanRef.current.textContent = label
  }, [label])

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [])

  return (
    <Link
      href={href}
      className="editorial-link px-3 py-1.5 micro-label transition-colors"
      style={{
        color: active ? '#C9A96A' : '#8A8378',
      }}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      <span ref={spanRef}>{label}</span>
    </Link>
  )
}

async function fetchUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isLoading } = useSWR('auth-user', fetchUser)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className="liquid-glass-bar sticky top-0 z-50"
      style={{
        borderBottom: '1px solid rgba(201, 169, 106, 0.18)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <AeropilotLogo size="sm" />
          </Link>
          <LiveBadge />
        </div>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <ScrambleNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? null : user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="editorial-btn py-1.5 px-3"
              style={{
                fontSize: '0.625rem',
                color: '#8A8378',
                borderColor: 'rgba(201, 169, 106, 0.25)',
              }}
            >
              <span>SIGN OUT</span>
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="editorial-link px-3 py-1.5 micro-label"
                style={{ color: '#8A8378' }}
              >
                LOG IN
              </Link>
              <Link
                href="/auth/sign-up"
                className="editorial-btn editorial-btn--solid py-1.5 px-3"
                style={{ fontSize: '0.625rem' }}
              >
                <span>SIGN UP</span>
                <span className="arrow">↗</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <nav
        aria-label="Mobile"
        className="flex items-center gap-1 overflow-x-auto px-2 py-1 md:hidden"
        style={{ borderTop: '1px solid rgba(201, 169, 106, 0.15)' }}
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap px-3 py-1 micro-label"
            style={{
              color: pathname.startsWith(item.href) ? '#C9A96A' : '#8A8378',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
