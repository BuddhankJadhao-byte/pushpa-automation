'use client'

import { motion } from 'motion/react'
import { ArrowUpRight, Cpu, Flame, Gauge, MonitorCog, Radar, Zap, type LucideIcon } from 'lucide-react'
import { Stagger, staggerItem } from '@/components/motion/primitives'
import { SectionHeading } from './section-heading'

const ITEMS: { icon: LucideIcon; title: string; body: string; span?: string }[] = [
  {
    icon: Cpu,
    title: 'PLC & HMI automation panels',
    body: 'Delta and Siemens PLCs with colour touchscreen HMIs, isolated I/O and ladder logic written for your machine.',
    span: 'md:col-span-2',
  },
  { icon: Gauge, title: 'VFD & motion drive panels', body: 'Speed control from 0.5 HP to 30 HP with braking, cooling and interlocks done right.' },
  { icon: Zap, title: 'Star-delta & motor starters', body: 'Starter panels up to 50 HP with copper busbars, metering and phase protection.' },
  { icon: Flame, title: 'Flameproof (Ex-d) panels', body: 'Enclosures for Zone 1 and Zone 2 hazardous areas in cast alloy or SS316.' },
  { icon: Radar, title: 'Sensors & field I/O', body: 'M18 proximity switches, laser limit sensors and Delta AS PLCs from ready stock.' },
  {
    icon: MonitorCog,
    title: 'Programming, SCADA & commissioning',
    body: 'Custom ladder logic, HMI mimic screens and remote telemetry — installed and handed over on site.',
    span: 'md:col-span-3',
  },
]

function Card({ icon: Icon, title, body, span = '' }: (typeof ITEMS)[number]) {
  return (
    <motion.a
      href="#contact"
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
      }}
      className={`group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-[border-color] duration-300 hover:border-line-strong sm:p-8 ${span}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--x) var(--y), rgb(245 165 36 / 0.13), transparent 45%)' }}
      />
      <div className="relative flex items-start justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-line-strong bg-raised text-accent transition-transform duration-500 ease-out-strong group-hover:-rotate-6 group-hover:scale-110">
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowUpRight
          className="size-5 -translate-x-2 translate-y-2 text-accent opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <div className="relative mt-10">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-md leading-relaxed text-muted">{body}</p>
      </div>
    </motion.a>
  )
}

export function Capabilities() {
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="container-x py-28 sm:py-36">
      <SectionHeading
        id="capabilities-title"
        index="01"
        eyebrow="Capabilities"
        title="Everything between the incomer and the motor."
        description="One workshop in MIDC Bhosari handles design, fabrication, wiring, programming and testing — so the panel that arrives on site is the panel that was proven on our bench."
      />
      <Stagger className="mt-16 grid gap-4 md:grid-cols-3">
        {ITEMS.map((item) => (
          <Card key={item.title} {...item} />
        ))}
      </Stagger>
    </section>
  )
}
