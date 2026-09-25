'use client'

import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react'

/** Live result of a CSS media query (false during SSR). */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

/** Strong ease-out: instant response, soft landing. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
/** Strong ease-in-out for on-screen movement. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const

type RevealProps = HTMLMotionProps<'div'> & { delay?: number; y?: number }

/** Fades, lifts and un-blurs its content the first time it scrolls into view. */
export function Reveal({ delay = 0, y = 24, children, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Parent for staggered children (use <StaggerItem>). */
export function Stagger({ gap = 0.07, children, ...rest }: HTMLMotionProps<'div'> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT } },
}

export function StaggerItem({ children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={staggerItem} {...rest}>
      {children}
    </motion.div>
  )
}

/** Headline where every word rises out of its own mask. */
export function SplitWords({
  text,
  className,
  delay = 0,
  onView = true,
}: {
  text: string
  className?: string
  delay?: number
  onView?: boolean
}) {
  const words = text.split(' ')
  const trigger = onView
    ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } }
    : { animate: 'show' }
  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: EASE_OUT } },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Pulls its child toward the cursor, springs back on leave. Fine pointers only. */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 })

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  return (
    <motion.span
      ref={ref}
      className="inline-flex"
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

/** Counts up to a stat such as "1,500+" or "5.0" when it scrolls into view. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const match = /^([\d,]*\.?\d+)(\D*)$/.exec(value.trim())
  const target = match ? Number(match[1].replace(/,/g, '')) : 0
  const decimals = match?.[1].split('.')[1]?.length ?? 0
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!match || !inView) return
    if (reduce) return setCurrent(target)
    const controls = animate(0, target, { duration: 1.6, ease: EASE_OUT, onUpdate: setCurrent })
    return () => controls.stop()
  }, [inView, reduce, target, match === null])

  if (!match) return <span className={className}>{value}</span>
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {current.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {match[2]}
      </span>
    </span>
  )
}

/** 3D tilt that follows the pointer with spring physics. */
export function Tilt({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 20 })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
    </motion.div>
  )
}
