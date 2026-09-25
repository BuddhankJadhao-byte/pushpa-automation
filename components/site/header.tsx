'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight, Phone } from 'lucide-react'
import { EASE_IN_OUT, EASE_OUT, Magnetic } from '@/components/motion/primitives'
import { telLink, whatsappLink, type Settings } from '@/lib/content'
import { Logo } from './logo'

type Props = { settings: Pick<Settings, 'phone' | 'whatsapp'>; hasProjects: boolean }

export function Header({ settings, hasProjects }: Props) {
  const nav = [
    { href: '/#capabilities', label: 'Capabilities' },
    { href: '/#products', label: 'Panels' },
    ...(hasProjects ? [{ href: '/#work', label: 'Our work' }] : []),
    { href: '/#estimate', label: 'Estimate' },
    { href: '/#reviews', label: 'Reviews' },
    { href: '/#contact', label: 'Contact' },
  ]
  const [active, setActive] = useState('')
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(y > previous && y > 240 && !open)
    setScrolled(y > 24)
  })

  // Highlight the section currently in the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`/#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4"
        animate={{ y: hidden ? '-140%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border px-3 py-2 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
            scrolled || open
              ? 'border-line-strong bg-canvas/75 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl'
              : 'border-transparent bg-transparent'
          }`}
        >
          <a href="/#top" className="flex shrink-0 items-center gap-3" aria-label="Pushpa Automation — back to top">
            <Logo className="h-9 w-auto text-fg" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href} className="relative">
                  {active === item.href && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/[0.07]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <a
                    href={item.href}
                    className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                      active === item.href ? 'text-fg' : 'text-muted hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telLink(settings.phone)}
              className="hidden items-center gap-2 rounded-full px-3 py-2 font-mono text-xs text-muted transition-colors hover:text-fg md:flex"
            >
              <Phone className="size-3.5" aria-hidden />
              {settings.phone}
            </a>
            <Magnetic>
              <a
                href="/#estimate"
                className="hidden items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97] sm:flex"
              >
                Get estimate
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative flex size-11 items-center justify-center rounded-full border border-line-strong lg:hidden"
            >
              <motion.span className="absolute h-px w-5 bg-fg" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} />
              <motion.span className="absolute h-px w-5 bg-fg" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-canvas px-6 pb-10 pt-28 lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.7, ease: EASE_IN_OUT }}
          >
            <nav aria-label="Mobile">
              <motion.ul
                className="space-y-1"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
              >
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { ease: EASE_OUT, duration: 0.6 } } }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 border-b border-line py-4 font-display text-4xl font-semibold tracking-tight"
                    >
                      <span className="font-mono text-xs text-accent">0{i + 1}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            >
              <a href={telLink(settings.phone)} className="rounded-xl border border-line-strong px-4 py-3 text-center text-sm font-medium">
                Call now
              </a>
              <a
                href={whatsappLink(settings.whatsapp, 'Hello Pushpa Automation, I would like to discuss a control panel.')}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-canvas"
              >
                WhatsApp
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
