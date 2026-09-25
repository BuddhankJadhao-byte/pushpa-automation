'use client'

import { Suspense, startTransition, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react'

export const inputClass =
  'w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-alert'

type FieldProps = {
  label: string
  name: string
  defaultValue?: string | number
  error?: string
  hint?: string
  rows?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>

/** Labelled text input (or textarea when `rows` is set) with inline error and hint. */
export function Field({ label, name, defaultValue, error, hint, rows, className = '', ...rest }: FieldProps) {
  const id = `f-${name}`
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          defaultValue={defaultValue}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${inputClass} resize-y`}
          maxLength={rest.maxLength}
          required={rest.required}
          placeholder={rest.placeholder}
        />
      ) : (
        <input id={id} name={name} defaultValue={defaultValue} aria-invalid={!!error} aria-describedby={describedBy} className={inputClass} {...rest} />
      )}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line-strong p-4">
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-sm text-subtle">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full bg-raised transition-colors duration-200 after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-fg after:transition-transform after:duration-200 peer-checked:bg-accent peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
      />
    </label>
  )
}

/**
 * Submits a form through a useActionState dispatcher without React's automatic form
 * reset, so a failed save never wipes what the owner typed or the photo they picked.
 */
export function submitWith(dispatch: (form: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(() => dispatch(form))
  }
}

export function SubmitButton({
  children,
  danger = false,
  className = '',
  pending: pendingProp,
}: {
  children: React.ReactNode
  danger?: boolean
  className?: string
  pending?: boolean
}) {
  const status = useFormStatus()
  const pending = pendingProp ?? status.pending
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-[background-color,transform,opacity] duration-200 active:scale-[0.97] disabled:opacity-60 ${
        danger ? 'bg-alert text-white hover:bg-alert/90' : 'bg-accent text-canvas hover:bg-accent-strong'
      } ${className}`}
    >
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function FormAlert({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm"
        >
          <CircleAlert className="size-4 shrink-0 text-alert" aria-hidden />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

const FLASH: Record<string, string> = { saved: 'Saved — the website is updated.', deleted: 'Deleted.' }

function FlashInner() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const key = Object.keys(FLASH).find((k) => params.has(k))
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    if (!key) return
    setText(FLASH[key])
    router.replace(pathname, { scroll: false })
    const t = window.setTimeout(() => setText(null), 3200)
    return () => window.clearTimeout(t)
  }, [key, pathname, router])

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          role="status"
          className="fixed inset-x-0 top-4 z-[95] mx-auto flex w-fit items-center gap-2 rounded-full border border-live/40 bg-canvas/90 px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <CircleCheck className="size-4 text-live" aria-hidden />
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Confirmation toast after a save/delete redirect (?saved=1 / ?deleted=1). */
export function Flash() {
  return (
    <Suspense>
      <FlashInner />
    </Suspense>
  )
}

/** Two-step delete: first tap arms it, second tap (within 4 s) submits. */
export function DeleteButton({
  action,
  fields,
  label = 'Delete',
}: {
  action: (form: FormData) => void | Promise<void>
  fields: Record<string, string>
  label?: string
}) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(t)
  }, [armed])

  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {armed ? (
        <SubmitButton danger className="px-4! py-2!">
          Confirm
        </SubmitButton>
      ) : (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-alert/60 hover:text-alert"
        >
          {label}
        </button>
      )}
    </form>
  )
}
