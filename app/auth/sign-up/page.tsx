'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PageReveal } from '@/components/page-reveal'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute left-1/2 bottom-[-40%] h-[70vh] w-[110vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201,169,106,0.09) 0%, transparent 62%)',
        }}
        aria-hidden="true"
      />

      <PageReveal className="w-full max-w-md">
        <div data-reveal className="text-center">
          <p className="micro-label" style={{ color: '#C9A96A' }}>
            AEROPILOT MEMBERSHIP
          </p>
          <h1
            className="mt-3 text-balance"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 4vw, 3rem)',
              fontWeight: 500,
              color: '#F4F1EA',
              lineHeight: 1.05,
            }}
          >
            Reserve your <em style={{ color: '#C9A96A' }}>seat</em>
          </h1>
        </div>

        <div data-reveal className="liquid-glass mt-8 p-8">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="editorial-btn w-full justify-center"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{isGoogleLoading ? 'REDIRECTING...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'rgba(138,131,120,0.25)' }} />
            <span className="micro-label" style={{ color: '#8A8378' }}>
              OR
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(138,131,120,0.25)' }} />
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="micro-label" style={{ color: '#8A8378' }}>
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                placeholder="traveller@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lux-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="micro-label" style={{ color: '#8A8378' }}>
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lux-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="repeat-password" className="micro-label" style={{ color: '#8A8378' }}>
                REPEAT PASSWORD
              </label>
              <input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="lux-input"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm" style={{ color: '#b3564e' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="editorial-btn editorial-btn--solid w-full justify-center disabled:opacity-50"
            >
              <span>{isLoading ? 'ISSUING PASS...' : 'SIGN UP'}</span>
              {!isLoading && <span className="arrow">↗</span>}
            </button>
          </form>
        </div>

        <p
          data-reveal
          className="mt-6 text-center text-sm"
          style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
        >
          Already a member?{' '}
          <Link
            href="/auth/login"
            className="underline underline-offset-4"
            style={{ color: '#C9A96A' }}
          >
            Log in
          </Link>
        </p>
      </PageReveal>
    </main>
  )
}
