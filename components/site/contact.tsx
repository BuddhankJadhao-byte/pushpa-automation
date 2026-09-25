'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react'
import { submitInquiry, type InquiryState } from '@/app/actions'
import { EASE_OUT, Stagger, StaggerItem } from '@/components/motion/primitives'
import { hoursLabel, isOpenNow, telLink, whatsappLink, type Settings } from '@/lib/content'
import { SectionHeading } from './section-heading'

const TOPICS = [
  'PLC & HMI panel',
  'VFD drive panel',
  'Star-delta starter',
  'Flameproof panel',
  'Sensors & PLCs',
  'Programming / service',
  'Something else',
]

const field =
  'w-full rounded-xl border border-line-strong bg-canvas px-4 py-3.5 text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-alert'

function Channel({ icon: Icon, label, value, href, external }: { icon: LucideIcon; label: string; value: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-[border-color,background-color] duration-300 hover:border-line-strong hover:bg-raised"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-500 ease-out-strong group-hover:scale-110 group-hover:-rotate-6">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{label}</span>
        <span className="mt-0.5 line-clamp-2 block break-words font-medium">{value}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
    </a>
  )
}

export function Contact({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, { ok: false })
  const [open, setOpen] = useState<boolean | null>(null)
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setOpen(isOpenNow(settings))
    // The estimator hands over its configuration so the visitor only adds name and phone.
    const onPrefill = (e: Event) => {
      const { topic, message } = (e as CustomEvent<{ topic: string; message: string }>).detail
      const fields = form.current?.elements
      if (!fields) return
      ;(fields.namedItem('topic') as HTMLSelectElement).value = TOPICS.find((t) => topic.startsWith(t.split(' ')[0])) ?? TOPICS.at(-1)!
      ;(fields.namedItem('message') as HTMLTextAreaElement).value = message
      ;(fields.namedItem('source') as HTMLInputElement).value = 'estimate'
      window.setTimeout(() => (fields.namedItem('name') as HTMLInputElement).focus({ preventScroll: true }), 600)
    }
    window.addEventListener('prefill-inquiry', onPrefill)
    return () => window.removeEventListener('prefill-inquiry', onPrefill)
  }, [settings])

  const err = state.errors ?? {}
  const v = state.values ?? {}

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="bg-blueprint absolute inset-0 -z-10 opacity-60" />
      <div className="container-x grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0">
          <SectionHeading
            id="contact-title"
            index="09"
            eyebrow="Contact"
            title="Let’s build your next panel."
            description="Tell us about the motor, the machine or the problem. An engineer — not a salesperson — will get back to you."
          />
          <Stagger className="mt-10 grid gap-3">
            <StaggerItem>
              <Channel icon={Phone} label="Call the workshop" value={settings.phone} href={telLink(settings.phone)} />
            </StaggerItem>
            <StaggerItem>
              <Channel
                icon={MessageCircle}
                label="WhatsApp"
                value="Chat with an engineer"
                href={whatsappLink(settings.whatsapp, 'Hello Pushpa Automation, I have an enquiry about control panels.')}
                external
              />
            </StaggerItem>
            <StaggerItem>
              <Channel icon={Mail} label="Email" value={settings.email} href={`mailto:${settings.email}`} />
            </StaggerItem>
            <StaggerItem>
              <Channel icon={MapPin} label="Visit" value={settings.address} href={settings.mapsUrl} external />
            </StaggerItem>
          </Stagger>
          <p className="mt-6 flex items-center gap-2.5 text-sm text-muted">
            <Clock className="size-4" aria-hidden />
            {hoursLabel(settings)}
            {open !== null && (
              <span className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${open ? 'bg-live/15 text-live' : 'bg-white/5 text-muted'}`}>
                <span className={`size-1.5 rounded-full ${open ? 'animate-lamp bg-live' : 'bg-subtle'}`} />
                {open ? 'Open now' : 'Closed now'}
              </span>
            )}
          </p>
        </div>

        <motion.div
          className="relative min-w-0 rounded-3xl border border-line-strong bg-surface p-6 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] sm:p-9"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state.ok ? (
              <motion.div
                key="done"
                role="status"
                className="flex min-h-[460px] flex-col items-center justify-center text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <svg viewBox="0 0 52 52" className="size-20 text-live" aria-hidden>
                  <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                  <motion.path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                </svg>
                <h3 className="mt-6 font-display text-3xl font-bold tracking-tight">Enquiry received.</h3>
                <p className="mt-3 max-w-sm text-muted">Thank you — an engineer will call you back during working hours. For anything urgent, WhatsApp us.</p>
                <a
                  href={whatsappLink(settings.whatsapp, 'Hello Pushpa Automation, I just sent an enquiry on your website.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-canvas transition-transform active:scale-[0.97]"
                >
                  <MessageCircle className="size-4" aria-hidden /> Open WhatsApp
                </a>
              </motion.div>
            ) : (
              <motion.form ref={form} key="form" action={action} className="grid gap-4" exit={{ opacity: 0, y: -10 }}>
                <h3 className="font-display text-2xl font-semibold tracking-tight">Send an enquiry</h3>
                <input type="hidden" name="source" defaultValue={v.source || 'contact'} />
                <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-sm text-muted">Your name</label>
                    <input id="c-name" name="name" defaultValue={v.name} required minLength={2} maxLength={80} autoComplete="name" className={field} aria-invalid={!!err.name} aria-describedby={err.name ? 'c-name-err' : undefined} />
                    {err.name && <p id="c-name-err" className="mt-1 text-sm text-alert">{err.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="mb-1.5 block text-sm text-muted">Phone / WhatsApp</label>
                    <input id="c-phone" name="phone" defaultValue={v.phone} type="tel" required minLength={7} maxLength={20} autoComplete="tel" inputMode="tel" className={field} aria-invalid={!!err.phone} aria-describedby={err.phone ? 'c-phone-err' : undefined} />
                    {err.phone && <p id="c-phone-err" className="mt-1 text-sm text-alert">{err.phone}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-sm text-muted">
                      Email <span className="text-subtle">(optional)</span>
                    </label>
                    <input id="c-email" name="email" defaultValue={v.email} type="email" maxLength={120} autoComplete="email" className={field} aria-invalid={!!err.email} aria-describedby={err.email ? 'c-email-err' : undefined} />
                    {err.email && <p id="c-email-err" className="mt-1 text-sm text-alert">{err.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-topic" className="mb-1.5 block text-sm text-muted">What do you need?</label>
                    <select id="c-topic" name="topic" defaultValue={v.topic || TOPICS[0]} className={field}>
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="c-message" className="mb-1.5 block text-sm text-muted">Project details</label>
                  <textarea
                    id="c-message"
                    name="message"
                    rows={5}
                    required
                    minLength={5}
                    maxLength={2000}
                    defaultValue={v.message}
                    placeholder="Motor ratings, quantity, site location, deadline…"
                    className={`${field} resize-y`}
                    aria-invalid={!!err.message}
                    aria-describedby={err.message ? 'c-message-err' : undefined}
                  />
                  {err.message && <p id="c-message-err" className="mt-1 text-sm text-alert">{err.message}</p>}
                </div>
                {state.message && !state.ok && (
                  <p role="alert" className="rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm">
                    {state.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-semibold text-canvas transition-[background-color,transform,opacity] duration-200 hover:bg-accent-strong active:scale-[0.98] disabled:opacity-70"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {pending ? 'Sending…' : 'Send enquiry'}
                  {!pending && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />}
                </button>
                <p className="text-xs leading-relaxed text-subtle">
                  We use these details only to reply to your enquiry. They are never shared or used for marketing.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
