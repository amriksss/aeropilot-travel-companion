import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-destructive">
          Authentication error
        </p>
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {params?.error
            ? `Error: ${params.error}`
            : 'An unspecified error occurred during authentication.'}
        </p>
        <Link
          href="/auth/login"
          className="rounded-sm bg-primary px-4 py-2 text-center text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to login
        </Link>
      </div>
    </main>
  )
}
