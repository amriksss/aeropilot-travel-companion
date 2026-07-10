import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="liquid-glass flex w-full max-w-sm flex-col gap-4 p-8">
        <p className="micro-label" style={{ color: '#b3564e' }}>
          AUTHENTICATION ERROR
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 500,
            color: '#F4F1EA',
          }}
        >
          Something went wrong
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: '#8A8378' }}
        >
          {params?.error
            ? `Error: ${params.error}`
            : 'An unspecified error occurred during authentication.'}
        </p>
        <Link href="/auth/login" className="editorial-btn editorial-btn--solid justify-center">
          <span>BACK TO LOGIN</span>
        </Link>
      </div>
    </main>
  )
}
