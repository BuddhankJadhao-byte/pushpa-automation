'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { MapPin } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'
import type { Project } from '@/lib/content'
import { SectionHeading } from './section-heading'
import { Dialog } from './dialog'
import { Media } from './media'

export function Projects({ projects }: { projects: Project[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = projects.find((p) => p.id === openId) ?? null

  return (
    <section id="work" aria-labelledby="work-title" className="container-x py-28 sm:py-36">
      <SectionHeading
        id="work-title"
        index="04"
        eyebrow="Our work"
        title="Panels already running on real plant floors."
        description="A selection of recent builds, installations and commissioning jobs from our team."
      />
      <ul className="mt-14 grid auto-rows-[18rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <motion.li
            key={p.id}
            className={i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}
            initial={{ opacity: 0, y: 40, clipPath: 'inset(12% 6% 0% 6% round 28px)' }}
            whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: EASE_OUT }}
          >
            <button
              type="button"
              onClick={() => setOpenId(p.id)}
              data-cursor="Open"
              className="group relative block size-full overflow-hidden rounded-[28px] border border-line text-left"
            >
              <Media
                src={p.image}
                alt={p.title}
                sizes={i === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                className="transition-transform duration-[900ms] ease-out-strong group-hover:scale-[1.07]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                {(p.location || p.year) && (
                  <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                    <MapPin className="size-3.5" aria-hidden />
                    {[p.location, p.year].filter(Boolean).join(' · ')}
                  </p>
                )}
                <h3 className={`mt-2 font-display font-semibold leading-tight tracking-tight ${i === 0 ? 'text-3xl' : 'text-xl'}`}>{p.title}</h3>
                {p.client && <p className="mt-1 text-sm text-muted">{p.client}</p>}
              </div>
            </button>
          </motion.li>
        ))}
      </ul>

      <Dialog open={!!open} onClose={() => setOpenId(null)} labelledBy="project-dialog-title" className="max-w-4xl">
        {open && (
          <>
            <div className="relative aspect-[16/10]">
              <Media src={open.image} alt={open.title} sizes="(min-width: 896px) 896px, 100vw" />
            </div>
            <div className="p-7 sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {[open.location, open.year].filter(Boolean).join(' · ') || 'Project'}
              </p>
              <h3 id="project-dialog-title" className="mt-3 font-display text-3xl font-bold tracking-tight">
                {open.title}
              </h3>
              {open.client && <p className="mt-1 text-muted">{open.client}</p>}
              {open.summary && <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">{open.summary}</p>}
              {open.tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {open.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Dialog>
    </section>
  )
}
