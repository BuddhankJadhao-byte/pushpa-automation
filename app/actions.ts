'use server'

import { createPublicClient, supabaseConfig } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { fieldErrors, inquirySchema } from '@/lib/schemas'

export type InquiryState = {
  ok: boolean
  message?: string
  errors?: Record<string, string>
  /** Echoed back on failure so React's automatic form reset keeps what the visitor typed. */
  values?: Record<string, string>
}

const CALL_US = 'Please call or WhatsApp us instead.'

export async function submitInquiry(_: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
  if (form.get('company')) return { ok: true }

  const values = Object.fromEntries(
    ['name', 'phone', 'email', 'topic', 'message', 'source'].map((k) => [k, String(form.get(k) ?? '').slice(0, 2000)]),
  )
  const fail = (message: string, errors?: Record<string, string>): InquiryState => ({ ok: false, message, errors, values })

  const parsed = inquirySchema.safeParse({ ...values, source: values.source || 'contact' })
  if (!parsed.success) return fail('Please check the highlighted fields.', fieldErrors(parsed.error))

  if (!supabaseConfig()) return fail(`Online enquiries are not switched on yet. ${CALL_US}`)
  if (!(await rateLimit('inquiry', 5, 3600))) return fail(`Too many enquiries from your network right now. ${CALL_US}`)

  const { error } = await createPublicClient().rpc('submit_inquiry', parsed.data)
  if (error) {
    console.error('submit_inquiry failed', error.code)
    return fail(`Something went wrong. ${CALL_US}`)
  }
  return { ok: true }
}
