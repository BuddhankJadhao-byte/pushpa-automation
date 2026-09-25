'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useSpring, useTransform } from 'motion/react'
import { MessageCircle, Send } from 'lucide-react'
import { EASE_OUT, Reveal } from '@/components/motion/primitives'
import { whatsappLink, type Settings } from '@/lib/content'
import { ADDONS, BRANDS, ENCLOSURES, PANEL_TYPES, estimate, inr, type EstimateInput } from '@/lib/estimate'
import { SectionHeading } from './section-heading'

function Segmented<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: Record<T, { label: string }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{legend}</legend>
      <LayoutGroup id={name}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(options) as T[]).map((key) => (
            <label key={key} className="relative">
              <input
                type="radio"
                name={name}
                value={key}
                checked={value === key}
                onChange={() => onChange(key)}
                className="peer sr-only"
              />
              {value === key && (
                <motion.span
                  layoutId={`${name}-pill`}
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                />
              )}
              <span
                className={`relative block rounded-xl border px-4 py-2.5 text-sm transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                  value === key ? 'border-transparent font-semibold text-canvas' : 'border-line-strong text-muted hover:text-fg'
                }`}
              >
                {options[key].label}
              </span>
            </label>
          ))}
        </div>
      </LayoutGroup>
    </fieldset>
  )
}

function AnimatedTotal({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 90, damping: 20 })
  const text = useTransform(spring, (v) => inr(v))
  useEffect(() => spring.set(value), [spring, value])
  return <motion.span aria-hidden>{text}</motion.span>
}

export function Estimator({ settings }: { settings: Settings }) {
  const [input, setInput] = useState<EstimateInput>({ type: 'plc', hp: 15, brand: 'delta', enclosure: 'ip55', addons: ['sensors'] })
  const { lines, total } = estimate(input)
  const set = <K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) => setInput((s) => ({ ...s, [key]: value }))

  const summary = [
    `Panel: ${PANEL_TYPES[input.type].label}, ${input.hp} HP`,
    `Controller: ${BRANDS[input.brand].label}`,
    `Enclosure: ${ENCLOSURES[input.enclosure].label}`,
    `Add-ons: ${input.addons.map((a) => ADDONS[a].label).join(', ') || 'none'}`,
    `Website estimate: ${inr(total)}`,
  ].join('\n')

  function requestQuote() {
    window.dispatchEvent(new CustomEvent('prefill-inquiry', { detail: { topic: `${PANEL_TYPES[input.type].label} panel`, message: `Please send a formal quotation.\n\n${summary}` } }))
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="estimate" aria-labelledby="estimate-title" className="relative border-y border-line bg-surface/40 py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading
          id="estimate-title"
          index="06"
          eyebrow="Instant estimate"
          title="Configure a panel. See the price move."
          description="An indicative factory estimate for your configuration — wiring, schematic drafting and inspection included. Your engineer confirms the final quote."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal className="space-y-9 rounded-3xl border border-line bg-canvas p-6 sm:p-9">
            <Segmented name="type" legend="Panel type" options={PANEL_TYPES} value={input.type} onChange={(v) => set('type', v)} />

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label htmlFor="hp" className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
                  Motor capacity
                </label>
                <span className="font-display text-3xl font-bold tabular-nums text-accent">
                  {input.hp} <span className="text-base font-medium text-muted">HP</span>
                </span>
              </div>
              <input
                id="hp"
                type="range"
                min={1}
                max={100}
                value={input.hp}
                onChange={(e) => set('hp', Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-raised [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-canvas [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-canvas [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgb(245_165_36)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125"
                style={{ background: `linear-gradient(to right, var(--color-accent) ${input.hp}%, var(--color-raised) ${input.hp}%)` }}
              />
            </div>

            <Segmented name="brand" legend="PLC / controller" options={BRANDS} value={input.brand} onChange={(v) => set('brand', v)} />
            <Segmented name="enclosure" legend="Enclosure" options={ENCLOSURES} value={input.enclosure} onChange={(v) => set('enclosure', v)} />

            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Add-ons</legend>
              {(Object.keys(ADDONS) as (keyof typeof ADDONS)[]).map((key) => {
                const on = input.addons.includes(key)
                return (
                  <label key={key} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors duration-200 ${on ? 'border-accent/60 bg-accent/[0.06]' : 'border-line-strong'}`}>
                    <span>
                      <span className="block font-medium">{ADDONS[key].label}</span>
                      <span className="block text-sm text-subtle">{ADDONS[key].note} · +{inr(ADDONS[key].price)}</span>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={on}
                      onChange={() => set('addons', on ? input.addons.filter((a) => a !== key) : [...input.addons, key])}
                      className="peer sr-only"
                    />
                    <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${on ? 'bg-accent' : 'bg-raised'}`}>
                      <motion.span
                        className="absolute left-1 top-1 size-5 rounded-full bg-fg"
                        animate={{ x: on ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </span>
                  </label>
                )
              })}
            </fieldset>
          </Reveal>

          <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-line-strong bg-canvas p-6 sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Factory estimate</p>
              <p className="mt-2 font-display text-5xl font-bold tracking-tight tabular-nums text-fg [font-stretch:108%]">
                <span className="sr-only">{inr(total)}</span>
                <AnimatedTotal value={total} />
              </p>
              <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <motion.li
                      key={l.label}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      className="flex justify-between gap-4 overflow-hidden"
                    >
                      <span className="text-muted">{l.label}</span>
                      <span className="font-mono tabular-nums">{l.amount ? inr(l.amount) : 'Included'}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-subtle">
                Indicative only. Final pricing depends on drawings, switchgear availability and site conditions.
              </p>
              <div className="mt-6 grid gap-3">
                <a
                  href={whatsappLink(settings.whatsapp, `Hello Pushpa Automation, I configured a panel on your website:\n\n${summary}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97]"
                >
                  <MessageCircle className="size-4" aria-hidden /> Send on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={requestQuote}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-3.5 font-medium transition-[background-color,transform] duration-200 hover:bg-white/5 active:scale-[0.97]"
                >
                  <Send className="size-4" aria-hidden /> Request a formal quote
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
