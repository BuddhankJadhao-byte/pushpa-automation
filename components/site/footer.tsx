'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUp, ArrowUpRight, Lock, MessageCircle, SquarePlay } from 'lucide-react'
import { EASE_IN_OUT, EASE_OUT, Magnetic } from '@/components/motion/primitives'
import { telLink, whatsappLink, type Settings } from '@/lib/content'
import { Logo } from './logo'

const WORD = 'PUSHPA'

export function Footer({ settings, categories }: { settings: Settings; categories: string[] }) {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-24">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <h2 className="max-w-2xl font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1] tracking-[-0.03em] [font-stretch:108%]">
            Have a panel in mind? <span className="text-accent">Let’s talk wiring.</span>
          </h2>
          <Magnetic strength={0.25}>
            <a
              href={whatsappLink(settings.whatsapp, 'Hello Pushpa Automation, I would like to discuss a control panel.')}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-5 text-lg font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97]"
            >
              <MessageCircle className="size-5" aria-hidden /> Start on WhatsApp
              <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
            </a>
          </Magnetic>
        </div>

        <div className="mt-20 grid gap-12 border-t border-line pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo className="h-12 w-auto text-fg" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Industrial control panels and automation systems, engineered and tested in MIDC Bhosari, Pune.
            </p>
          </div>
          <nav aria-label="Footer">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['/#capabilities', 'Capabilities'],
                ['/#products', 'Panels'],
                ['/#anatomy', 'Inside a panel'],
                ['/#estimate', 'Instant estimate'],
                ['/#reviews', 'Reviews'],
                ['/#faq', 'FAQ'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="group inline-flex items-center gap-1 text-muted transition-colors hover:text-fg">
                    <span className="h-px w-0 bg-accent transition-[width] duration-300 group-hover:w-3" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Panels</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c}>
                  <a href="/#products" className="text-muted transition-colors hover:text-fg">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Reach us</h3>
            <address className="mt-5 space-y-3 text-sm not-italic text-muted">
              <p>{settings.address}</p>
              <p>
                <a href={telLink(settings.phone)} className="text-fg hover:text-accent">
                  {settings.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-fg">
                  {settings.email}
                </a>
              </p>
              {settings.youtubeUrl && (
                <p>
                  <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg">
                    <SquarePlay className="size-4" aria-hidden /> YouTube channel
                  </a>
                </p>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* Letters rise out of the clipped wordmark when it scrolls into view. */}
      <motion.p
        aria-hidden
        className="text-outline pointer-events-none mt-16 select-none overflow-hidden text-center font-display text-[24vw] font-black leading-[0.8] tracking-[-0.06em] [font-stretch:125%]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        {WORD.split('').map((c, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{ hidden: { y: '100%' }, show: { y: '0%', transition: { duration: 1, ease: EASE_IN_OUT } } }}
          >
            {c}
          </motion.span>
        ))}
      </motion.p>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} Pushpa Automation &amp; Robotics Industries. All rights reserved.</p>
          <a href="/admin" className="inline-flex items-center gap-1.5 transition-colors hover:text-fg">
            <Lock className="size-3" aria-hidden /> Owner login
          </a>
        </div>
      </div>
    </footer>
  )
}

/** Floating WhatsApp button + back-to-top, shown once the visitor is past the hero. */
export function FloatingActions({ whatsapp }: { whatsapp: string }) {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > 700))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="flex size-11 items-center justify-center rounded-full border border-line-strong bg-canvas/80 backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <a
            href={whatsappLink(whatsapp, 'Hello Pushpa Automation, I have an enquiry about control panels.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="group relative flex size-14 items-center justify-center rounded-full bg-live text-canvas shadow-[0_12px_40px_-8px_rgb(34_197_94/0.6)] transition-transform duration-200 active:scale-95"
          >
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-live/40 [animation-duration:2.4s]" />
            <MessageCircle className="relative size-6" aria-hidden />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
