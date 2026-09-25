'use client'

import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, ClipboardCheck, Cpu, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { EASE_OUT, Magnetic, Reveal, SplitWords, Stagger, StaggerItem, Tilt } from '@/components/motion/primitives'
import { telLink, whatsappLink, type Product, type Project, type Settings } from '@/lib/content'
import { Media } from './media'

const TRUST = [
  { icon: ShieldCheck, text: 'Genuine OEM switchgear only' },
  { icon: ClipboardCheck, text: 'Inspected and tested before dispatch' },
  { icon: BadgeCheck, text: '1-year comprehensive warranty' },
  { icon: Cpu, text: 'Custom ladder logic included on PLC panels' },
]

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-10 font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <a href={item.href} className="transition-colors hover:text-accent">
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className="text-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Frame({ src, alt }: { src: string | null; alt: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1, ease: EASE_OUT }}
    >
      <Tilt max={5}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line-strong bg-surface">
          <Media src={src} alt={alt} sizes="(min-width: 1024px) 50vw, 100vw" />
          {['left-4 top-4 border-l border-t', 'right-4 top-4 border-r border-t', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((c) => (
            <span key={c} aria-hidden className={`absolute size-5 border-accent/80 ${c}`} />
          ))}
        </div>
      </Tilt>
    </motion.div>
  )
}

export function ProductPage({ product, related, settings }: { product: Product; related: Product[]; settings: Settings }) {
  const enquiry = `Hello Pushpa Automation, I'm interested in the ${product.name}${product.price ? ` (${product.price})` : ''}. Please share details and availability.`
  return (
    <>
      <section className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40">
        <div aria-hidden className="bg-blueprint absolute inset-0 -z-10" />
        <div className="container-x">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Panels', href: '/#products' }, { label: product.name }]} />
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Frame src={product.image} alt={product.name} />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{product.category}</p>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-[1] tracking-[-0.03em] [font-stretch:108%]">
                <SplitWords text={product.name} onView={false} delay={0.1} />
              </h1>
              {product.oem && <p className="mt-3 text-muted">{product.oem}</p>}
              <Reveal delay={0.3}>
                {product.summary && <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{product.summary}</p>}
                <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-line pt-6">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">Indicative price</p>
                    <p className="mt-1 font-display text-4xl font-bold text-accent">{product.price || 'On request'}</p>
                  </div>
                  {product.tags.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {product.tags.map((t) => (
                        <li key={t} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Magnetic>
                    <a
                      href={whatsappLink(settings.whatsapp, enquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-canvas transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-[0.97]"
                    >
                      <MessageCircle className="size-4" aria-hidden /> Enquire on WhatsApp
                    </a>
                  </Magnetic>
                  <a
                    href={telLink(settings.phone)}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 font-medium transition-[background-color,transform] duration-200 hover:bg-white/5 active:scale-[0.97]"
                  >
                    <Phone className="size-4" aria-hidden /> {settings.phone}
                  </a>
                  <a href="/#estimate" className="inline-flex items-center gap-2 px-2 py-3.5 text-sm text-muted hover:text-fg">
                    Get an instant estimate <ArrowRight className="size-4" aria-hidden />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {product.specs.length > 0 && (
        <section aria-labelledby="specs-title" className="container-x py-16">
          <h2 id="specs-title" className="font-display text-3xl font-bold tracking-tight">
            Technical specifications
          </h2>
          <Stagger className="mt-8 grid gap-3 md:grid-cols-2">
            {product.specs.map((spec) => {
              const [label, ...rest] = spec.split(':')
              return (
                <StaggerItem key={spec} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                  <Check className="mt-0.5 size-5 shrink-0 text-live" aria-hidden />
                  <p className="leading-relaxed">
                    {rest.length ? (
                      <>
                        <span className="font-semibold">{label.trim()}:</span> <span className="text-muted">{rest.join(':').trim()}</span>
                      </>
                    ) : (
                      spec
                    )}
                  </p>
                </StaggerItem>
              )
            })}
          </Stagger>
        </section>
      )}

      <section aria-label="Why buy from us" className="container-x py-10">
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, text }) => (
            <StaggerItem key={text} className="flex items-center gap-3 rounded-2xl border border-line p-5 text-sm">
              <Icon className="size-5 shrink-0 text-accent" aria-hidden /> {text}
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="container-x py-20">
          <h2 id="related-title" className="font-display text-3xl font-bold tracking-tight">
            More panels
          </h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <StaggerItem key={p.id}>
                <a href={`/products/${p.slug}`} data-cursor="View" className="group block overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color] hover:border-line-strong">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Media src={p.image} alt={p.name} sizes="(min-width: 1024px) 33vw, 50vw" className="transition-transform duration-700 ease-out-strong group-hover:scale-[1.06]" />
                  </div>
                  <div className="flex items-start justify-between gap-3 p-5">
                    <span>
                      <span className="block font-display text-lg font-semibold">{p.name}</span>
                      <span className="mt-1 block font-mono text-sm text-accent">{p.price || 'On request'}</span>
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-muted transition-transform group-hover:rotate-45 group-hover:text-accent" aria-hidden />
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </>
  )
}

export function ProjectPage({ project, others, settings }: { project: Project; others: Project[]; settings: Settings }) {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-32 sm:pt-40">
        <div aria-hidden className="bg-blueprint absolute inset-0 -z-10" />
        <div className="container-x">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Our work', href: '/#work' }, { label: project.title }]} />
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Frame src={project.image} alt={project.title} />
            <div>
              {(project.location || project.year) && (
                <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  <MapPin className="size-3.5" aria-hidden /> {[project.location, project.year].filter(Boolean).join(' · ')}
                </p>
              )}
              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1] tracking-[-0.03em] [font-stretch:108%]">
                <SplitWords text={project.title} onView={false} delay={0.1} />
              </h1>
              {project.client && <p className="mt-3 text-muted">{project.client}</p>}
              <Reveal delay={0.3}>
                {project.summary && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted">{project.summary}</p>}
                {project.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <li key={t} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <a
                  href={whatsappLink(settings.whatsapp, `Hello Pushpa Automation, I saw your project "${project.title}" and need something similar.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-semibold text-canvas transition-transform active:scale-[0.97]"
                >
                  <MessageCircle className="size-4" aria-hidden /> Need something similar?
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="more-work" className="container-x py-20">
          <h2 id="more-work" className="font-display text-3xl font-bold tracking-tight">
            More of our work
          </h2>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <StaggerItem key={p.id}>
                <a href={`/work/${p.slug}`} data-cursor="Open" className="group relative block aspect-[4/3] overflow-hidden rounded-3xl border border-line">
                  <Media src={p.image} alt={p.title} sizes="(min-width: 1024px) 33vw, 50vw" className="transition-transform duration-700 ease-out-strong group-hover:scale-[1.06]" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-5 font-display text-lg font-semibold">{p.title}</span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </>
  )
}
