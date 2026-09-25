'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, type MotionValue } from 'motion/react'
import { useMediaQuery } from '@/components/motion/primitives'

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]'

/** Amber scroll-progress rail across the top of the page. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-accent/40 via-accent to-accent-strong"
      style={{ scaleX }}
    />
  )
}

/** Soft amber light that trails the cursor behind the content (transform-only, GPU cheap). */
function Spotlight({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
      style={{ x, y, background: 'radial-gradient(circle, rgb(245 165 36 / 0.09), transparent 62%)' }}
    />
  )
}

/** Ring + dot cursor that swells over anything clickable and shows a label for data-cursor targets. */
function Cursor({ x, y, rawX, rawY }: Record<'x' | 'y' | 'rawX' | 'rawY', MotionValue<number>>) {
  const [hover, setHover] = useState<{ active: boolean; label: string }>({ active: false, label: '' })
  const [down, setDown] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      setVisible(true)
      const target = (e.target as Element | null)?.closest?.(INTERACTIVE)
      const label = target?.getAttribute('data-cursor') ?? ''
      setHover((prev) => (prev.active === !!target && prev.label === label ? prev : { active: !!target, label }))
    }
    const leave = () => setVisible(false)
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
    }
  }, [])

  const size = hover.label ? 84 : hover.active ? 52 : 34
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/70 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-canvas"
          animate={{
            width: size,
            height: size,
            scale: down ? 0.82 : 1,
            backgroundColor: hover.label ? 'rgb(245 165 36 / 1)' : hover.active ? 'rgb(245 165 36 / 0.12)' : 'rgb(245 165 36 / 0)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <AnimatePresence>
            {hover.label && (
              <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                {hover.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ x: rawX, y: rawY }}
      />
    </div>
  )
}

type Spark = { id: number; x: number; y: number }

/** An electrical "spark" burst wherever the visitor clicks or taps. */
function ClickSparks() {
  const [sparks, setSparks] = useState<Spark[]>([])
  useEffect(() => {
    let id = 0
    const onDown = (e: PointerEvent) => {
      const spark = { id: ++id, x: e.clientX, y: e.clientY }
      setSparks((s) => [...s.slice(-4), spark])
      window.setTimeout(() => setSparks((s) => s.filter((p) => p.id !== spark.id)), 700)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[79]">
      {sparks.map((s) => (
        <div key={s.id} className="absolute" style={{ left: s.x, top: s.y }}>
          <motion.span
            className="absolute -left-5 -top-5 size-10 rounded-full border border-accent"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          />
          {Array.from({ length: 8 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute left-0 top-0 h-px w-3 origin-left bg-accent-strong"
              style={{ rotate: i * 45 }}
              initial={{ x: 4, scaleX: 1, opacity: 1 }}
              animate={{ x: 22, scaleX: 0.2, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Effects() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduce = useReducedMotion()
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)
  const x = useSpring(rawX, { stiffness: 350, damping: 32, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 350, damping: 32, mass: 0.6 })
  const slowX = useSpring(rawX, { stiffness: 60, damping: 20 })
  const slowY = useSpring(rawY, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const move = (e: PointerEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [rawX, rawY])

  return (
    <>
      <ScrollProgress />
      {!reduce && <ClickSparks />}
      {fine && !reduce && (
        <>
          <Spotlight x={slowX} y={slowY} />
          <Cursor x={x} y={y} rawX={rawX} rawY={rawY} />
        </>
      )}
    </>
  )
}
