// The owner's session cookie: unreadable by JavaScript, HTTPS-only in production,
// and only sent to /admin — public pages never see it.
export const SESSION_COOKIE = {
  path: '/admin',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
} as const
