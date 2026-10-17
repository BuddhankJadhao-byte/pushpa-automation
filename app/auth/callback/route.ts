import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/supabase/cookie'
import { supabaseConfig } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const config = supabaseConfig()
    if (config) {
      const cookieStore = await cookies()
      const supabase = createServerClient(config.url, config.key, {
        cookieOptions: SESSION_COOKIE,
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll(list) {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, ...SESSION_COOKIE }),
            )
          },
        },
      })
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url))
      }
      console.error('[Auth] exchangeCodeForSession failed:', error)
    }
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}
