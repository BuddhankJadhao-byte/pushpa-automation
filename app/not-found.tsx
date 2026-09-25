import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bg-blueprint flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Error 404 · circuit open</p>
      <h1 className="font-display text-6xl font-bold tracking-tight [font-stretch:110%]">This page is not wired up.</h1>
      <p className="max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="rounded-full bg-accent px-6 py-3 font-semibold text-canvas transition-transform active:scale-[0.97]">
        Back to the homepage
      </Link>
    </main>
  )
}
