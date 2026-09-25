'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'

type Props = {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: React.ReactNode
  className?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Accessible modal: traps focus, closes on Esc/backdrop, locks page scroll, restores focus. */
export function Dialog({ open, onClose, labelledBy, children, className = '' }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      opener?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-canvas/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line-strong bg-surface shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9)] sm:rounded-3xl ${className}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <button
              type="button"
              onClick={onClose}
              data-autofocus
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full border border-line-strong bg-canvas/70 backdrop-blur transition-transform duration-200 hover:rotate-90 active:scale-95"
            >
              <X className="size-4" aria-hidden />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
