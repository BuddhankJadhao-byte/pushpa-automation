'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useMediaQuery } from '@/components/motion/primitives'
import { SectionHeading } from './section-heading'

const CHAPTERS = [
  {
    title: 'The enclosure',
    body: '14-gauge CRCA steel, RAL 7035 powder coat and PU-gasketed doors. IP55 as standard; IP65 double-gasket or SS304 stainless on request.',
    image: '/images/plc_hmi_panel.jpg',
    focus: '30% 50%',
  },
  {
    title: 'Power & protection',
    body: 'Genuine Siemens and L&T breakers, contactors and overload relays, with tinned electrolytic copper busbars on heavy starters.',
    image: '/images/star_delta_panel.jpg',
    focus: '30% 20%',
  },
  {
    title: 'The control brain',
    body: 'Delta AS or Siemens S7-1200 PLCs with optically isolated I/O, a clean 24 V supply and DIN-rail layout in slotted ducts.',
    image: '/images/delta_as_plc.jpg',
    focus: '50% 50%',
  },
  {
    title: 'Drives & motion',
    body: 'Delta MS300 / C2000 or Schneider Altivar drives with braking resistors, line chokes and forced-air cooling.',
    image: '/images/vfd_heavy_panel.jpg',
    focus: '60% 40%',
  },
  {
    title: 'HMI & SCADA',
    body: 'Touchscreen mimic pages, alarms and trends — with optional remote telemetry over MQTT or to an SQL historian.',
    image: '/images/plc_hmi_panel.jpg',
    focus: '38% 30%',
  },
  {
    title: 'Sensors, then the test bench',
    body: 'Proximity and laser sensors wired to field terminals. Every panel is inspected and tested in our Bhosari workshop before dispatch.',
    image: '/images/industrial_sensors_pack.jpg',
    focus: '50% 50%',
  },
]

function Chapter({ i, progress, pinned }: { i: number; progress: MotionValue<number>; pinned: boolean }) {
  const c = CHAPTERS[i]
  const center = (i + 0.5) / CHAPTERS.length
  const scale = useTransform(progress, [center - 0.35, center + 0.1], [1.25, 1])
  return (
    <article
      className={`relative flex shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-line bg-surface ${
        pinned ? 'h-[72vh] w-[46vw] max-w-[640px]' : 'w-[85vw] max-w-[440px]'
      }`}
    >
      <div className={`relative overflow-hidden ${pinned ? 'flex-1' : 'aspect-[4/3]'}`}>
        <motion.div className="absolute inset-0" style={pinned ? { scale } : undefined}>
          <Image src={c.image} alt="" fill sizes="(min-width: 768px) 46vw, 85vw" className="object-cover" style={{ objectPosition: c.focus }} />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
        <span className="absolute left-6 top-5 font-display text-7xl font-black text-white/15 [font-stretch:120%]">0{i + 1}</span>
      </div>
      <div className="p-7">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{c.title}</h3>
        <p className="mt-3 leading-relaxed text-muted">{c.body}</p>
      </div>
    </article>
  )
}

export function Anatomy() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const pinned = useMediaQuery('(min-width: 768px)')
  const [distance, setDistance] = useState(0)
  const [current, setCurrent] = useState(0)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const x = useTransform(smooth, [0, 1], [0, -distance])
  const bar = useTransform(smooth, [0, 1], [0, 1])

  useLayoutEffect(() => {
    if (!pinned || !track.current) return
    const measure = () => setDistance(Math.max(0, track.current!.scrollWidth - window.innerWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned])

  useMotionValueEvent(smooth, 'change', (v) => setCurrent(Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length))))

  const heading = (
    <SectionHeading
      id="anatomy-title"
      index="03"
      eyebrow="Inside every panel"
      title="Six layers of engineering you never have to think about."
    />
  )

  if (!pinned) {
    return (
      <section id="anatomy" ref={section} aria-labelledby="anatomy-title" className="relative py-28">
        <div className="container-x">{heading}</div>
        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
          {CHAPTERS.map((_, i) => (
            <Chapter key={i} i={i} progress={scrollYProgress} pinned={false} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="anatomy" ref={section} aria-labelledby="anatomy-title" className="relative h-[480vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} className="flex items-center gap-6 pl-[6vw] pr-[6vw]" style={{ x }} data-cursor="Scroll">
          <div className="flex w-[34vw] max-w-[520px] shrink-0 flex-col justify-center pr-8">
            {heading}
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-subtle">Keep scrolling →</p>
          </div>
          {CHAPTERS.map((_, i) => (
            <Chapter key={i} i={i} progress={smooth} pinned />
          ))}
        </motion.div>

        <div className="container-x mt-8 flex items-center gap-5 font-mono text-xs text-muted">
          <span className="tabular-nums text-fg">0{current + 1}</span>
          <div className="relative h-px flex-1 bg-line-strong">
            <motion.div className="absolute inset-0 origin-left bg-accent" style={{ scaleX: bar }} />
          </div>
          <span className="tabular-nums">0{CHAPTERS.length}</span>
        </div>
      </div>
    </section>
  )
}
