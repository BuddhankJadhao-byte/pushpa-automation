// The owner's session cookie: unreadable by JavaScript, HTTPS-only in production.
// Set to root path so /auth/callback and /admin both have access to session and PKCE verifier.
export const SESSION_COOKIE = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
} as const

