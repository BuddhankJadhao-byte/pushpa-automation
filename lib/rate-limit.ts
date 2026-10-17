import 'server-only'
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { createPublicClient, supabaseConfig } from '@/lib/supabase/server'

/**
 * Per-visitor sliding-window limit, stored in Postgres so it holds across serverless
 * instances. IPs are hashed before they leave this function; rows expire within a day.
 * Fails closed: if the check itself errors, the request is refused.
 */
export async function rateLimit(scope: string, maxHits: number, windowSeconds: number) {
  if (!supabaseConfig()) return true
  const h = await headers()
  const ip = h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${scope}:${createHash('sha256').update(ip).digest('hex').slice(0, 32)}`
  const { data, error } = await createPublicClient().rpc('rate_limit', { key, max_hits: maxHits, window_seconds: windowSeconds })
  if (error) {
    const raw = error.message || ''
    const msg = error.code || (raw.startsWith('<') ? 'upstream returned HTML' : raw) || 'unknown error'
    console.error('rate_limit failed:', msg)
  }
  return !error && data === true
}
