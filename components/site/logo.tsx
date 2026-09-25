'use client'

import { motion } from 'motion/react'
import { EASE_IN_OUT, EASE_OUT } from '@/components/motion/primitives'

/**
 * The PA & RI mark: a precision frame with a notch for "BORN TO FLY".
 * `draw` animates the frame being traced, as in the intro.
 */
export function Logo({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="38 32 324 136" className={className} role="img" aria-label="PA & RI — Pushpa Automation & Robotics Industries">
      <motion.path
        d="M95 155 H45 V40 H355 V155 H305"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="square"
        initial={draw ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE_IN_OUT }}
      />
      <motion.text
        x="200"
        y="97"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize="60"
        fontWeight="900"
        letterSpacing="5"
        style={{ fontStretch: '115%' }}
        initial={draw ? { opacity: 0, y: 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: draw ? 0.45 : 0, ease: EASE_OUT }}
      >
        PA &amp; RI
      </motion.text>
      <motion.text
        x="200"
        y="156"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-accent"
        fontFamily="var(--font-display)"
        fontSize="15"
        fontWeight="800"
        letterSpacing="7"
        initial={draw ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: draw ? 0.9 : 0 }}
      >
        BORN TO FLY
      </motion.text>
    </svg>
  )
}
