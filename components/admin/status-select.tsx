'use client'

import { useRef } from 'react'

const LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', closed: 'Closed' }

/** Changing the dropdown saves immediately. */
export function StatusSelect({ id, status, action }: { id: string; status: string; action: (form: FormData) => void | Promise<void> }) {
  const form = useRef<HTMLFormElement>(null)
  return (
    <form ref={form} action={action}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`status-${id}`}>
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        onChange={() => form.current?.requestSubmit()}
        className={`rounded-full border px-4 py-2 text-sm font-medium ${
          status === 'new' ? 'border-accent bg-accent text-canvas' : status === 'contacted' ? 'border-live/50 text-live' : 'border-line-strong text-subtle'
        }`}
      >
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value} className="bg-canvas text-fg">
            {label}
          </option>
        ))}
      </select>
    </form>
  )
}
