'use client'

import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'

const BRANDS = ['Siemens', 'L&T Switchgear', 'Schneider Electric', 'ABB', 'Delta Electronics']
const SKILLS = ['PLC programming', 'HMI & SCADA', 'VFD drives', 'Star-delta starters', 'Flameproof Ex-d', 'Sensors & I/O', 'Commissioning']

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/** A row that drifts continuously and speeds up — or reverses — with the visitor's scroll. */
function VelocityRow({ items, speed, className }: { items: string[]; speed: number; className: string }) {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const direction = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const f = factor.get()
    if (f < 0) direction.current = -1
    else if (f > 0) direction.current = 1
    const move = direction.current * speed * (delta / 1000)
    base.set(base.get() + move + move * Math.abs(f))
  })

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className={`flex items-center ${className}`}>
          {item}
          <span aria-hidden className="mx-8 inline-block size-2 rotate-45 bg-accent sm:mx-12" />
        </span>
      ))}
    </div>
  )

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex" style={{ x }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </div>
  )
}

export function Marquee() {
  return (
    <section aria-label="Genuine OEM components we build with" className="relative border-y border-line py-10 sm:py-14">
      <p className="container-x mb-8 font-mono text-xs uppercase tracking-[0.22em] text-subtle">
        Built only with genuine OEM switchgear
      </p>
      <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <VelocityRow
          items={BRANDS}
          speed={-2.2}
          className="font-display text-5xl font-extrabold uppercase tracking-tight text-fg [font-stretch:118%] sm:text-7xl"
        />
        <VelocityRow items={SKILLS} speed={1.6} className="text-outline font-display text-4xl font-bold uppercase sm:text-6xl" />
      </div>
    </section>
  )
}
