'use client'

import Link from 'next/link'

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-alert">Something went wrong</p>
      <h1 className="font-display text-3xl font-bold tracking-tight">That action could not be completed.</h1>
      <p className="max-w-md text-muted">Nothing was lost. Please try again — if it keeps happening, sign out and back in.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-canvas">
          Try again
        </button>
        <Link href="/admin" className="rounded-full border border-line-strong px-5 py-3 text-sm">
          Dashboard
        </Link>
      </div>
    </main>
  )
}
