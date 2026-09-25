'use client'

import { motion } from 'motion/react'
import { Check, MessageCircle, Phone } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'
import { telLink, whatsappLink, type Product, type Settings } from '@/lib/content'
import { Dialog } from './dialog'
import { Media } from './media'

export function ProductDialog({
  product,
  settings,
  onClose,
}: {
  product: Product | null
  settings: Settings
  onClose: () => void
}) {
  return (
    <Dialog open={!!product} onClose={onClose} labelledBy="product-dialog-title" className="max-w-5xl">
      {product && (
        <div className="grid md:grid-cols-2">
          <motion.div layoutId={`product-media-${product.id}`} className="relative aspect-[4/3] md:aspect-auto md:min-h-full">
            <Media src={product.image} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" />
          </motion.div>
          <div className="p-7 sm:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{product.category}</p>
            <h3 id="product-dialog-title" className="mt-3 pr-10 font-display text-3xl font-bold leading-tight tracking-tight">
              {product.name}
            </h3>
            {product.oem && <p className="mt-2 text-sm text-subtle">{product.oem}</p>}
            {product.summary && <p className="mt-5 leading-relaxed text-muted">{product.summary}</p>}

            {product.specs.length > 0 && (
              <motion.ul
                className="mt-7 space-y-3 border-t border-line pt-6"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
              >
                {product.specs.map((spec) => (
                  <motion.li
                    key={spec}
                    className="flex gap-3 text-sm leading-relaxed"
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { ease: EASE_OUT } } }}
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-live" aria-hidden />
                    <span>{spec}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {product.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                    {t}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex items-end justify-between border-t border-line pt-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Indicative price</p>
                <p className="mt-1 font-display text-3xl font-bold text-accent">{product.price || 'On request'}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={whatsappLink(settings.whatsapp, `Hello Pushpa Automation, I'm interested in the ${product.name}${product.price ? ` (${product.price})` : ''}. Please share details and availability.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97]"
              >
                <MessageCircle className="size-4" aria-hidden /> Enquire on WhatsApp
              </a>
              <a
                href={telLink(settings.phone)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-3.5 font-medium transition-[background-color,transform] duration-200 hover:bg-white/5 active:scale-[0.97]"
              >
                <Phone className="size-4" aria-hidden /> Call an engineer
              </a>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  )
}
