'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, MessageCircle, Star } from 'lucide-react'
import { CountUp, EASE_OUT, Magnetic, SplitWords, Tilt, useMediaQuery } from '@/components/motion/primitives'
import { whatsappLink, type Settings } from '@/lib/content'

const BUILDS = ['PLC-HMI panels', 'VFD drive panels', 'star-delta starters', 'flameproof Ex-d panels', 'sensor packages']

const CHIPS = [
  { label: 'IP65 CRCA enclosure', lamp: 'bg-live', className: 'left-4 top-[10%] lg:left-[-6%] lg:top-[14%]', float: 5.5 },
  { label: '415 V · 3-phase', lamp: 'bg-accent', className: 'right-4 top-[42%] lg:right-[-5%] lg:top-[38%]', float: 6.5 },
  { label: 'Dispatch in 48–72 h', lamp: 'bg-live', className: 'bottom-[18%] left-4 lg:bottom-[12%] lg:left-[4%]', float: 7 },
]

function RotatingWord() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % BUILDS.length), 2400)
    return () => window.clearInterval(t)
  }, [])
  return (
    <span className="relative inline-grid overflow-hidden align-bottom text-fg">
      <AnimatePresence initial={false}>
        <motion.span
          key={BUILDS[i]}
          className="col-start-1 row-start-1 whitespace-nowrap"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          {BUILDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function Hero({ settings }: { settings: Settings }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  // Side-by-side only on large screens; stacked layouts must not drift into each other.
  const wide = useMediaQuery('(min-width: 1024px)')

  const stats = [
    { value: settings.statPanels, label: 'Panels delivered' },
    { value: settings.statRating, label: 'Google rating' },
    { value: settings.statReviews, label: 'Verified reviews' },
    { value: settings.statDispatch, label: 'Typical dispatch' },
  ].filter((s) => s.value)

  return (
    <section id="top" ref={ref} className="relative isolate overflow-hidden pb-16 pt-32 sm:pt-40">
      <div aria-hidden className="bg-blueprint absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-10%] -z-10 h-[680px] w-[980px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]"
      />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <motion.div style={wide ? { y: copyY, opacity: fade } : undefined}>
          <motion.p
            className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.2em] text-muted"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-live/70" />
              <span className="relative size-2 rounded-full bg-live" />
            </span>
            We engineer <RotatingWord />
          </motion.p>

          <h1 className="font-display text-[clamp(2.6rem,7vw,5.6rem)] font-bold leading-[0.95] tracking-[-0.035em] [font-stretch:112%]">
            <SplitWords text="Control panels built to keep your" onView={false} delay={0.15} />{' '}
            <SplitWords text="plant running." onView={false} delay={0.5} className="text-accent" />
          </h1>

          <motion.p
            className="mt-7 max-w-xl text-lg leading-relaxed text-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE_OUT }}
          >
            Pushpa Automation &amp; Robotics Industries designs, wires and tests industrial control panels in MIDC
            Bhosari, Pune — with genuine Siemens, L&amp;T, Schneider, ABB and Delta switchgear and a 1-year warranty.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE_OUT }}
          >
            <Magnetic>
              <a
                href="#estimate"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97]"
              >
                Get an instant estimate
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={whatsappLink(settings.whatsapp, 'Hello Pushpa Automation, I would like to talk to an engineer about a control panel.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 font-medium transition-[background-color,transform] duration-200 hover:bg-white/5 active:scale-[0.97]"
              >
                <MessageCircle className="size-4 text-live" aria-hidden />
                WhatsApp an engineer
              </a>
            </Magnetic>
          </motion.div>

          <motion.a
            href="#reviews"
            className="mt-8 inline-flex items-center gap-3 text-sm text-muted transition-colors hover:text-fg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.25 + i * 0.07, type: 'spring', stiffness: 300, damping: 14 }}>
                  <Star className="size-4 fill-accent text-accent" />
                </motion.span>
              ))}
            </span>
            <span>
              <strong className="font-semibold text-fg">{settings.statRating}</strong> on Google · {settings.statReviews} reviews
            </span>
          </motion.a>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT }}
        >
          <Tilt className="relative" max={6}>
            <div className="relative overflow-hidden rounded-[28px] border border-line-strong bg-surface" data-cursor="Explore">
              <motion.div style={{ y: imageY, scale: imageScale }}>
                <Image
                  src="/images/plc_hmi_panel.jpg"
                  alt="PLC HMI control panel with the door open, showing PLC, contactors and wiring"
                  width={1200}
                  height={896}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="eager"
                  fetchPriority="high"
                  quality={85}
                  className="h-auto w-full"
                />
              </motion.div>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent" />
              {/* Corner ticks echo the frame in the PA & RI mark */}
              {['left-4 top-4 border-l border-t', 'right-4 top-4 border-r border-t', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((c) => (
                <span key={c} aria-hidden className={`absolute size-5 border-accent/80 ${c}`} />
              ))}
              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-fg/80">
                <span>PLC · HMI · VFD</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 animate-lamp rounded-full bg-live" /> Factory tested
                </span>
              </div>
            </div>
          </Tilt>

          {CHIPS.map((chip, i) => (
            <motion.div
              key={chip.label}
              className={`absolute hidden items-center gap-2 rounded-full border border-line-strong bg-canvas/80 px-4 py-2 text-xs font-medium shadow-2xl backdrop-blur-md sm:flex ${chip.className}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
              transition={{
                opacity: { delay: 1 + i * 0.15, duration: 0.5 },
                scale: { delay: 1 + i * 0.15, duration: 0.5, ease: EASE_OUT },
                y: { delay: 1.5 + i * 0.15, duration: chip.float, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <span className={`size-2 rounded-full ${chip.lamp} animate-lamp`} />
              {chip.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {stats.length > 0 && (
        <div className="container-x mt-20">
          <motion.dl
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-surface p-6 sm:p-8">
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{s.label}</dt>
                <dd className="mt-2 whitespace-nowrap font-display text-3xl font-bold tracking-tight [font-stretch:110%] sm:text-5xl">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      )}
    </section>
  )
}
