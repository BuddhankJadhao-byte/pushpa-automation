'use client'

import { DEFAULT_SETTINGS, telLink, whatsappLink } from '@/lib/content'

/** Shown if the site cannot load its content (e.g. the database is briefly unreachable). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="bg-blueprint flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Temporary fault</p>
      <h1 className="font-display text-5xl font-bold tracking-tight [font-stretch:110%]">We tripped a breaker.</h1>
      <p className="max-w-md text-muted">The page could not load just now. Try again, or reach our engineers directly.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-accent px-6 py-3 font-semibold text-canvas transition-transform active:scale-[0.97]">
          Try again
        </button>
        <a href={telLink(DEFAULT_SETTINGS.phone)} className="rounded-full border border-line-strong px-6 py-3 font-medium">
          Call {DEFAULT_SETTINGS.phone}
        </a>
        <a
          href={whatsappLink(DEFAULT_SETTINGS.whatsapp, 'Hello Pushpa Automation, I have an enquiry.')}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line-strong px-6 py-3 font-medium"
        >
          WhatsApp
        </a>
      </div>
    </main>
  )
}
