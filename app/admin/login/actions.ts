'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSessionClient, supabaseConfig } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export type LoginState = { step: 'email' | 'code'; email?: string; message?: string; error?: boolean }

const emailSchema = z.email().max(120)
const codeSchema = z.string().regex(/^\d{6,10}$/)
const allowed = (scope: string, max: number) => rateLimit(scope, max, 900)

/** Step 1 (email only) sends a code; step 2 (email + code) verifies it. */
export async function login(state: LoginState, form: FormData): Promise<LoginState> {
  return form.has('code') ? verifyCode(form) : sendCode(form)
}

async function sendCode(form: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(form.get('email') ?? '').trim().toLowerCase())
  if (!email.success) return { step: 'email', message: 'Enter a valid email address.', error: true }
  if (!supabaseConfig()) return { step: 'email', message: 'The backend is not connected yet (see SETUP.md).', error: true }
  if (!(await allowed('login-send', 5))) return { step: 'email', message: 'Too many attempts. Wait 15 minutes and try again.', error: true }

  const db = await createSessionClient()
  // shouldCreateUser: false — this form can never create accounts. Only the owner's
  // pre-created account receives a code.
  const { error } = await db.auth.signInWithOtp({ email: email.data, options: { shouldCreateUser: false } })
  if (error) {
    console.error('[Auth] signInWithOtp failed:', {
      email: email.data,
      status: error.status,
      code: error.code,
      message: error.message,
    })

    if (error.status === 429) {
      return { step: 'email', message: 'Too many login code requests. Please wait a few minutes and try again.', error: true }
    }
    if (error.status === 422 || error.status === 400) {
      if (error.code === 'email_provider_disabled') {
        return { step: 'email', message: 'Email login provider is disabled in Supabase Authentication settings.', error: true }
      }
      return {
        step: 'email',
        message: 'No registered owner account found for this email. Check Supabase Authentication -> Users.',
        error: true,
      }
    }
    return {
      step: 'email',
      message: 'Email delivery failed (SMTP 500). In Supabase -> Project Settings -> Authentication -> SMTP: Gmail requires a 16-character Google App Password (not your normal Gmail password), and Sender Email must be pariindia91@gmail.com. Alternatively, turn off Custom SMTP.',
      error: true,
    }
  }

  return { step: 'code', email: email.data, message: 'If this is the owner email, a login code is on its way. Check the inbox (and spam).' }
}

async function verifyCode(form: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(form.get('email') ?? '').trim().toLowerCase())
  const code = codeSchema.safeParse(String(form.get('code') ?? '').replace(/\s/g, ''))
  if (!email.success) return { step: 'email', message: 'Start again with your email address.', error: true }
  if (!code.success) return { step: 'code', email: email.data, message: 'Enter the code from the email (digits only).', error: true }
  if (!(await allowed('login-verify', 10))) {
    return { step: 'code', email: email.data, message: 'Too many attempts. Wait 15 minutes and try again.', error: true }
  }

  const db = await createSessionClient()
  const { error } = await db.auth.verifyOtp({ email: email.data, token: code.data, type: 'email' })
  if (error) return { step: 'code', email: email.data, message: 'That code is wrong or has expired.', error: true }

  const { data: isOwner } = await db.rpc('is_admin')
  if (isOwner !== true) {
    await db.auth.signOut()
    return { step: 'email', message: 'This account does not have owner access.', error: true }
  }
  redirect('/admin')
}
