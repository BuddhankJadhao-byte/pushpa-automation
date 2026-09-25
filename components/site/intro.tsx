'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE_IN_OUT } from '@/components/motion/primitives'
import { Logo } from './logo'

const KEY = 'pa-intro'
let seenThisLoad: boolean | null = null // survives React's dev double-mount

function alreadySeen() {
  if (seenThisLoad === null) {
    try {
      seenThisLoad = sessionStorage.getItem(KEY) === '1'
      sessionStorage.setItem(KEY, '1')
    } catch {
      seenThisLoad = false
    }
  }
  return seenThisLoad
}

/** Brand intro: the logo frame is traced, then the curtain lifts. Once per browser session. */
export function Intro() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (alreadySeen()) return setShow(false)
    const skip = () => setShow(false)
    const timer = window.setTimeout(skip, 1900)
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skip)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="intro"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-canvas"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
          onClick={() => setShow(false)}
          aria-hidden
        >
          <Logo draw className="w-48 text-fg sm:w-60" />
          <motion.div
            className="h-px w-48 origin-left bg-accent sm:w-60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: EASE_IN_OUT }}
          />
          <motion.p
            className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Pushpa Automation &amp; Robotics Industries
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
