'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'
import { Logo } from '@/components/site/logo'
import { SubmitButton, inputClass } from '@/components/admin/ui'
import { login, type LoginState } from './actions'

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState<LoginState, FormData>(login, { step: 'email' })
  const onCodeStep = state.step === 'code'
  const email = state.email ?? ''
  const status = state.message
  const isError = state.error

  return (
    <motion.div
      className="w-full max-w-md rounded-3xl border border-line-strong bg-surface/90 p-7 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl sm:p-9"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <Logo draw className="h-11 w-auto text-fg" />
      <p className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        <ShieldCheck className="size-3.5" aria-hidden /> Owner access only
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {!onCodeStep ? (
          <motion.form
            key="email"
            action={action}
            className="mt-3 space-y-4"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted">Enter the owner email. We will send a one-time login code — no password needed.</p>
            <label htmlFor="email" className="sr-only">
              Owner email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="owner@email.com" defaultValue={email} className={inputClass} disabled={!configured} />
            <SubmitButton className="w-full">
              <MailCheck className="size-4" aria-hidden /> Email me a code
            </SubmitButton>
          </motion.form>
        ) : (
          <motion.form
            key="code"
            action={action}
            className="mt-3 space-y-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight">Enter your code</h1>
            <p className="text-sm text-muted">
              Sent to <span className="text-fg">{email}</span>. The code expires soon — use the newest email.
            </p>
            <input type="hidden" name="email" value={email} />
            <label htmlFor="code" className="sr-only">
              Login code
            </label>
            <input
              id="code"
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,12}"
              maxLength={12}
              placeholder="123456"
              autoFocus
              className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
            />
            <SubmitButton className="w-full">
              <KeyRound className="size-4" aria-hidden /> Verify and sign in
            </SubmitButton>
            <button type="button" onClick={() => window.location.reload()} className="flex w-full items-center justify-center gap-1.5 text-sm text-muted hover:text-fg">
              <ArrowLeft className="size-3.5" aria-hidden /> Use a different email
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status || !configured) && (
          <motion.p
            role={isError || !configured ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${isError || !configured ? 'border-alert/40 bg-alert/10' : 'border-live/40 bg-live/10'}`}
          >
            {configured ? status : 'The database is not connected yet, so sign-in is unavailable. Follow SETUP.md to connect Supabase.'}
          </motion.p>
        )}
      </AnimatePresence>

      <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-subtle hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden /> Back to website
      </Link>
    </motion.div>
  )
}
