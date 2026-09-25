'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { EASE_OUT, Stagger, StaggerItem } from '@/components/motion/primitives'
import { hoursLabel, type Settings } from '@/lib/content'
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(0)
  const items = [
    {
      q: 'How quickly can you deliver a panel?',
      a: `Ready designs from stock typically dispatch in ${settings.statDispatch}. Custom builds are scheduled as soon as drawings and the bill of materials are approved.`,
    },
    {
      q: 'Which switchgear brands do you use?',
      a: 'Genuine Siemens, L&T, Schneider Electric, ABB and Delta components — sourced through proper channels, never grey-market parts.',
    },
    {
      q: 'Is PLC and HMI programming included?',
      a: 'Yes. Custom ladder logic programming is included with our PLC panels, along with HMI screens designed around your process.',
    },
    { q: 'What warranty do the panels carry?', a: 'Every panel comes with a 1-year comprehensive factory warranty, backed by prompt troubleshooting support.' },
    { q: 'Do you supply outside Pune?', a: 'Yes. We build in MIDC Bhosari, Pune and supply panels to plants across India.' },
    {
      q: 'Can I visit the workshop?',
      a: `Of course — we are at ${settings.address}, open ${hoursLabel(settings)}. Call ahead and an engineer will walk you through a build.`,
    },
  ]

  return (
    <section id="faq" aria-labelledby="faq-title" className="container-x grid gap-14 py-28 sm:py-36 lg:grid-cols-[0.8fr_1.2fr]">
      <SectionHeading id="faq-title" index="08" eyebrow="Questions" title="Answers before you ask." />
      <Stagger>
        {items.map((item, i) => (
          <StaggerItem key={item.q}>
            <Item {...item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
