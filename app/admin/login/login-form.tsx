'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { EASE_OUT } from '@/components/motion/primitives'
import { Logo } from '@/components/site/logo'
import { SubmitButton, inputClass } from '@/components/admin/ui'
import { login, type LoginState } from './actions'

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState<LoginState, FormData>(login, {
    mode: 'password',
    step: 'email',
  })

  const [activeTab, setActiveTab] = useState<'password' | 'code'>(state.mode ?? 'password')
  const [showPassword, setShowPassword] = useState(false)

  // Sync tab with state updates if server indicates a mode
  useEffect(() => {
    if (state.mode) {
      setActiveTab(state.mode)
    }
  }, [state.mode])

  const onCodeStep = activeTab === 'code' && state.step === 'code'
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

      {/* Mode switch tabs */}
      <div className="mt-6 flex rounded-xl border border-line-strong bg-canvas/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'password'
              ? 'bg-surface text-fg shadow-sm border border-line-strong'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Lock className="size-3.5" aria-hidden /> Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold tracking-wide transition-all ${
            activeTab === 'code'
              ? 'bg-surface text-fg shadow-sm border border-line-strong'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Mail className="size-3.5" aria-hidden /> One-Time Code
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'password' ? (
          <motion.form
            key="password-tab"
            action={action}
            className="mt-5 space-y-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <input type="hidden" name="login_mode" value="password" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Sign in with password</h1>
              <p className="mt-1 text-sm text-muted">
                Use your owner email and the password you set in Supabase.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                Owner Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="pariindia91@gmail.com"
                defaultValue={email || 'pariindia91@gmail.com'}
                className={inputClass}
                disabled={!configured}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`${inputClass} pr-11`}
                  disabled={!configured}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <SubmitButton className="w-full mt-2">
              <Lock className="size-4" aria-hidden /> Sign in
            </SubmitButton>
          </motion.form>
        ) : !onCodeStep ? (
          <motion.form
            key="code-send-tab"
            action={action}
            className="mt-5 space-y-4"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <input type="hidden" name="login_mode" value="code" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">One-time code</h1>
              <p className="mt-1 text-sm text-muted">
                Enter your owner email to receive a temporary login code or link.
              </p>
            </div>

            <div>
              <label htmlFor="code-email" className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                Owner Email
              </label>
              <input
                id="code-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="pariindia91@gmail.com"
                defaultValue={email || 'pariindia91@gmail.com'}
                className={inputClass}
                disabled={!configured}
              />
            </div>

            <SubmitButton className="w-full mt-2">
              <MailCheck className="size-4" aria-hidden /> Email me a code
            </SubmitButton>
          </motion.form>
        ) : (
          <motion.form
            key="code-verify-tab"
            action={action}
            className="mt-5 space-y-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <input type="hidden" name="login_mode" value="code" />
            <input type="hidden" name="email" value={email} />

            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Enter your code</h1>
              <p className="mt-1 text-sm text-muted">
                Sent to <span className="text-fg font-medium">{email}</span>. Use the 6-digit code or link.
              </p>
            </div>

            <div>
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
            </div>

            <SubmitButton className="w-full">
              <KeyRound className="size-4" aria-hidden /> Verify and sign in
            </SubmitButton>

            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className="flex w-full items-center justify-center gap-1.5 text-sm text-accent hover:underline pt-1"
            >
              <Lock className="size-3.5" aria-hidden /> Or sign in with Password instead
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status || !configured) && (
          <motion.div
            role={isError || !configured ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
              isError || !configured
                ? 'border-alert/40 bg-alert/10 text-alert'
                : 'border-live/40 bg-live/10 text-live'
            }`}
          >
            {configured
              ? status
              : 'The database is not connected yet, so sign-in is unavailable. Follow SETUP.md to connect Supabase.'}
          </motion.div>
        )}
      </AnimatePresence>

      <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-subtle hover:text-fg transition-colors">
        <ArrowLeft className="size-3.5" aria-hidden /> Back to website
      </Link>
    </motion.div>
  )
}
