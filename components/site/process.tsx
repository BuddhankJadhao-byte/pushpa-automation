'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { EASE_OUT } from '@/components/motion/primitives'
import { SectionHeading } from './section-heading'

const STEPS = [
  { title: 'Enquiry & requirement', body: 'Share motor loads, drawings or simply a photo of your existing panel — on a call or on WhatsApp.' },
  { title: 'Engineering & drawings', body: 'We select the switchgear, draft schematics and the general arrangement, and confirm the bill of materials with you.' },
  { title: 'Fabrication', body: 'The CRCA enclosure is cut, bent and powder coated to the IP rating your site needs.' },
  { title: 'Wiring & programming', body: 'Ferruled, colour-coded wiring in slotted ducts, with PLC and HMI programs written for your process.' },
  { title: 'Testing & inspection', body: 'Every panel is powered up and inspected on our bench in Bhosari before it leaves the workshop.' },
  { title: 'Dispatch & commissioning', body: 'Ready designs ship in 48–72 hours, backed by a 1-year on-site warranty and responsive support.' },
]

function Step({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const at = i / (STEPS.length - 1)
  const lit = useTransform(progress, [at - 0.06, at], [0, 1])
  const numberColor = useTransform(lit, [0, 1], ['#a1a1aa', '#0a0a0b'])
  return (
    <li className="relative pb-14 pl-14 last:pb-0">
      <span className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-line-strong bg-canvas font-mono text-xs text-muted">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent shadow-[0_0_24px_rgb(245_165_36/0.6)]"
          style={{ opacity: lit, scale: lit }}
        />
        <motion.span className="relative" style={{ color: numberColor }}>
          0{i + 1}
        </motion.span>
      </span>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <h3 className="font-display text-2xl font-semibold tracking-tight">{STEPS[i].title}</h3>
        <p className="mt-2 max-w-lg leading-relaxed text-muted">{STEPS[i].body}</p>
      </motion.div>
    </li>
  )
}

export function Process() {
  const list = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 65%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })

  return (
    <section id="process" aria-labelledby="process-title" className="container-x grid gap-16 py-28 sm:py-36 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <SectionHeading
          id="process-title"
          index="05"
          eyebrow="How we work"
          title="From first call to a running motor."
          description="A clear, six-stage process — so you always know what is happening with your panel and when it will arrive."
        />
      </div>
      <ol ref={list} className="relative">
        <span aria-hidden className="absolute left-[17px] top-2 h-[calc(100%-2.5rem)] w-px bg-line-strong" />
        <motion.span
          aria-hidden
          className="absolute left-[17px] top-2 h-[calc(100%-2.5rem)] w-px origin-top bg-accent"
          style={{ scaleY: progress }}
        />
        {STEPS.map((_, i) => (
          <Step key={i} i={i} progress={progress} />
        ))}
      </ol>
    </section>
  )
}
