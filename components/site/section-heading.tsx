'use client'

import { motion } from 'motion/react'
import { EASE_OUT, Reveal, SplitWords } from '@/components/motion/primitives'

type Props = {
  index: string
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  id?: string
}

/** Numbered section title: an index rule that draws in, a masked headline and a short lede. */
export function SectionHeading({ index, eyebrow, title, description, align = 'left', id }: Props) {
  const center = align === 'center'
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <div className={`mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-accent ${center ? 'justify-center' : ''}`}>
        <span>{index}</span>
        <motion.span
          aria-hidden
          className="h-px w-10 origin-left bg-accent/60"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
        <span className="text-muted">{eyebrow}</span>
      </div>
      <h2 id={id} className="font-display text-[clamp(2.1rem,4.6vw,3.8rem)] font-bold leading-[1] tracking-[-0.03em] [font-stretch:108%]">
        <SplitWords text={title} />
      </h2>
      {description && (
        <Reveal delay={0.15}>
          <p className={`mt-5 text-lg leading-relaxed text-muted ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{description}</p>
        </Reveal>
      )}
    </div>
  )
}
