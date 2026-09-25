'use client'

import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'
import type { Product, Settings } from '@/lib/content'
import { SectionHeading } from './section-heading'
import { ProductDialog } from './product-dialog'
import { Media } from './media'

export function Products({ products, settings }: { products: Product[]; settings: Settings }) {
  const categories = ['All', ...new Set(products.map((p) => p.category))]
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const shown = filter === 'All' ? products : products.filter((p) => p.category === filter)
  const open = products.find((p) => p.id === openId) ?? null

  return (
    <section id="products" aria-labelledby="products-title" className="relative py-28 sm:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading
            id="products-title"
            index="02"
            eyebrow="The catalogue"
            title="Panels ready for your plant floor."
            description="Every panel ships with genuine switchgear, schematic drawings, factory inspection and a 1-year warranty. Tap any panel for full specifications."
          />
          {categories.length > 2 && (
            <LayoutGroup id="product-filter">
              <div role="group" aria-label="Filter panels by category" className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={filter === c}
                    onClick={() => setFilter(c)}
                    className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                      filter === c ? 'text-canvas' : 'text-muted hover:text-fg'
                    }`}
                  >
                    {filter === c && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{c}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>

        {products.length === 0 ? (
          <p className="mt-16 rounded-3xl border border-dashed border-line-strong p-12 text-center text-muted">
            New panels are being added — call or WhatsApp us for the current range.
          </p>
        ) : (
          <motion.ul layout className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setOpenId(p.id)}
                    data-cursor="View"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE_OUT }}
                    whileTap={{ scale: 0.98 }}
                    className="group block w-full overflow-hidden rounded-3xl border border-line bg-surface text-left transition-[border-color] duration-300 hover:border-line-strong"
                  >
                    <motion.div layoutId={`product-media-${p.id}`} className="relative aspect-[4/3] overflow-hidden">
                      <Media
                        src={p.image}
                        alt={p.name}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="transition-transform duration-700 ease-out-strong group-hover:scale-[1.06]"
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-canvas/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur">
                        {p.category}
                      </span>
                    </motion.div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">{p.name}</h3>
                        <ArrowUpRight
                          className="mt-1 size-5 shrink-0 text-muted transition-[color,transform] duration-300 group-hover:rotate-45 group-hover:text-accent"
                          aria-hidden
                        />
                      </div>
                      {p.oem && <p className="mt-1 text-sm text-subtle">{p.oem}</p>}
                      <div className="mt-6 flex items-end justify-between gap-3 border-t border-line pt-4">
                        <span className="font-mono text-lg font-semibold text-accent">{p.price || 'On request'}</span>
                        {p.tags[0] && <span className="text-right font-mono text-[11px] uppercase tracking-wider text-subtle">{p.tags[0]}</span>}
                      </div>
                    </div>
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <ProductDialog product={open} settings={settings} onClose={() => setOpenId(null)} />
    </section>
  )
}
