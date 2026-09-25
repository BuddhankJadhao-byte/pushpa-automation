import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { SESSION_COOKIE } from './cookie'

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  return url && key ? { url, key } : null
}

function requireConfig() {
  const config = supabaseConfig()
  if (!config) throw new Error('Backend not configured: set SUPABASE_URL and SUPABASE_ANON_KEY.')
  return config
}

/** Cookie-less client for public, read-only queries (cache-safe). */
export function createPublicClient() {
  const { url, key } = requireConfig()
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Client bound to the visitor's session cookie. Row Level Security decides what it may do. */
export async function createSessionClient() {
  const { url, key } = requireConfig()
  const store = await cookies()
  return createServerClient(url, key, {
    cookieOptions: SESSION_COOKIE,
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, { ...options, ...SESSION_COOKIE }))
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  })
}

/**
 * Gate for every admin page and Server Action. The database decides who is an
 * owner (public.is_admin), so this check and Row Level Security can never disagree.
 */
export const requireAdmin = cache(async () => {
  if (!supabaseConfig()) redirect('/admin/login')
  const supabase = await createSessionClient()
  const { data, error } = await supabase.rpc('is_admin')
  if (error || data !== true) redirect('/admin/login')
  return supabase
})
