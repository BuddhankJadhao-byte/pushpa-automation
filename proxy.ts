import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SESSION_COOKIE } from '@/lib/supabase/cookie'

function contentSecurityPolicy(nonce: string) {
  const dev = process.env.NODE_ENV === 'development'
  const supabase = process.env.SUPABASE_URL ? ` ${new URL(process.env.SUPABASE_URL).origin}` : ''
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? ` 'unsafe-eval'` : ''}`,
    // Animation libraries write style attributes; inline <style> injection is not used for anything else.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:${supabase}`,
    `font-src 'self'`,
    `connect-src 'self'${dev ? ' ws:' : ''}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const csp = contentSecurityPolicy(nonce)
  const { pathname } = request.nextUrl
  const code = request.nextUrl.searchParams.get('code')

  if (code && pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('next', '/admin')
    return NextResponse.redirect(callbackUrl)
  }

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  // Refresh the owner's session on admin routes only; public pages never carry auth cookies.
  let pendingCookies: { name: string; value: string; options: object }[] = []
  let pendingHeaders: Record<string, string> = {}
  let signedIn = false

  if (isAdmin && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const supabase = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      cookieOptions: SESSION_COOKIE,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies, headers) {
          pendingCookies = cookies
          pendingHeaders = headers
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    })
    const { data } = await supabase.auth.getClaims()
    signedIn = Boolean(data?.claims?.sub)
  }

  let response: NextResponse
  if (isAdmin && !signedIn && pathname !== '/admin/login') {
    response = NextResponse.redirect(new URL('/admin/login', request.url))
  } else {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', csp)
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, { ...options, ...SESSION_COOKIE }),
  )
  Object.entries(pendingHeaders).forEach(([key, value]) => response.headers.set(key, value))
  if (isAdmin) {
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|images/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
