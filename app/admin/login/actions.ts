'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSessionClient, supabaseConfig } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export type LoginState = {
  mode?: 'password' | 'code'
  step?: 'email' | 'code'
  email?: string
  message?: string
  error?: boolean
}

const emailSchema = z.string().email().max(120)
const codeSchema = z.string().regex(/^\d{6,10}$/)
const allowed = (scope: string, max: number) => rateLimit(scope, max, 900)

/** Dispatches to password login, OTP send, or OTP verify based on form fields. */
export async function login(state: LoginState, form: FormData): Promise<LoginState> {
  const loginMode = form.get('login_mode')
  if (loginMode === 'password' || form.has('password')) {
    return loginWithPassword(form)
  }
  return form.has('code') ? verifyCode(form) : sendCode(form)
}

async function loginWithPassword(form: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(form.get('email') ?? '').trim().toLowerCase())
  const password = String(form.get('password') ?? '')

  if (!email.success) {
    return { mode: 'password', step: 'email', message: 'Enter a valid email address.', error: true }
  }
  if (!password) {
    return { mode: 'password', step: 'email', email: email.data, message: 'Enter your password.', error: true }
  }
  if (!supabaseConfig()) {
    return { mode: 'password', step: 'email', message: 'The backend is not connected yet (see SETUP.md).', error: true }
  }
  if (!(await allowed('login-pass', 15))) {
    return { mode: 'password', step: 'email', email: email.data, message: 'Too many attempts. Wait 15 minutes and try again.', error: true }
  }

  const db = await createSessionClient()
  const { error } = await db.auth.signInWithPassword({
    email: email.data,
    password,
  })

  if (error) {
    console.error('[Auth] signInWithPassword failed:', {
      email: email.data,
      status: error.status,
      message: error.message,
    })
    return {
      mode: 'password',
      step: 'email',
      email: email.data,
      message: error.status === 400 ? 'Incorrect email or password. Please check your password and try again.' : error.message,
      error: true,
    }
  }

  const { data: isOwner } = await db.rpc('is_admin')
  if (isOwner !== true) {
    await db.auth.signOut()
    return {
      mode: 'password',
      step: 'email',
      email: email.data,
      message: 'This account does not have owner access. Make sure your email is confirmed and added to public.admins.',
      error: true,
    }
  }

  redirect('/admin')
}

async function sendCode(form: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(form.get('email') ?? '').trim().toLowerCase())
  if (!email.success) return { mode: 'code', step: 'email', message: 'Enter a valid email address.', error: true }
  if (!supabaseConfig()) return { mode: 'code', step: 'email', message: 'The backend is not connected yet (see SETUP.md).', error: true }
  if (!(await allowed('login-send', 5))) {
    return {
      mode: 'password',
      step: 'email',
      email: email.data,
      message: 'Too many code attempts. If you have set a password, use the Password tab above to sign in immediately.',
      error: true,
    }
  }

  const db = await createSessionClient()
  const siteUrl = 'https://www.pushpaautobotics.com'
  const emailRedirectTo = `${siteUrl}/auth/callback?next=/admin`
  const { error } = await db.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo,
    },
  })
  if (error) {
    console.error('[Auth] signInWithOtp failed:', {
      email: email.data,
      status: error.status,
      code: error.code,
      message: error.message,
    })

    if (error.status === 429) {
      return {
        mode: 'password',
        step: 'email',
        email: email.data,
        message: 'Too many login code requests were sent to your email. Please use your Password in the tab above to sign in immediately!',
        error: true,
      }
    }
    if (error.status === 422 || error.status === 400) {
      if (error.code === 'email_provider_disabled') {
        return { mode: 'code', step: 'email', message: 'Email login provider is disabled in Supabase Authentication settings.', error: true }
      }
      return {
        mode: 'code',
        step: 'email',
        message: 'No registered owner account found for this email. Check Supabase Authentication -> Users.',
        error: true,
      }
    }
    return {
      mode: 'password',
      step: 'email',
      email: email.data,
      message: 'Email delivery failed. Since you have set a password, please use the Password tab above to sign in directly without waiting for email delivery.',
      error: true,
    }
  }

  return { mode: 'code', step: 'code', email: email.data, message: 'If this is the owner email, a login code is on its way. Check your inbox (and spam).' }
}

async function verifyCode(form: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(String(form.get('email') ?? '').trim().toLowerCase())
  const code = codeSchema.safeParse(String(form.get('code') ?? '').replace(/\s/g, ''))
  if (!email.success) return { mode: 'code', step: 'email', message: 'Start again with your email address.', error: true }
  if (!code.success) return { mode: 'code', step: 'code', email: email.data, message: 'Enter the code from the email (digits only).', error: true }
  if (!(await allowed('login-verify', 10))) {
    return { mode: 'code', step: 'code', email: email.data, message: 'Too many attempts. Wait 15 minutes and try again.', error: true }
  }

  const db = await createSessionClient()
  const { error } = await db.auth.verifyOtp({ email: email.data, token: code.data, type: 'email' })
  if (error) return { mode: 'code', step: 'code', email: email.data, message: 'That code is wrong or has expired. You can also sign in with your Password above.', error: true }

  const { data: isOwner } = await db.rpc('is_admin')
  if (isOwner !== true) {
    await db.auth.signOut()
    return { mode: 'code', step: 'email', message: 'This account does not have owner access.', error: true }
  }
  redirect('/admin')
}
