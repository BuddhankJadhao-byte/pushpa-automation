'use client'

import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { Stagger, StaggerItem } from '@/components/motion/primitives'
import { faqItems, type Settings } from '@/lib/content'
import { SectionHeading } from './section-heading'

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-xl font-medium tracking-tight transition-colors hover:text-accent sm:text-2xl"
        >
          {q}
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${open ? 'border-accent bg-accent text-canvas' : 'border-line-strong'}`}
          >
            <Plus className="size-4" aria-hidden />
          </motion.span>
        </button>
      </h3>
      {/* Answers stay in the HTML (search engines and AI crawlers read them); only their height animates. */}
      <div
        id={id}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-strong ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-7 leading-relaxed text-muted">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function Faq({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" aria-labelledby="faq-title" className="container-x grid gap-14 py-28 sm:py-36 lg:grid-cols-[0.8fr_1.2fr]">
      <SectionHeading id="faq-title" index="08" eyebrow="Questions" title="Answers before you ask." />
      <Stagger>
        {faqItems(settings).map((item, i) => (
          <StaggerItem key={item.q}>
            <Item {...item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
