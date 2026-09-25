import type { NextConfig } from 'next'

// Owner-uploaded images live in the public "media" bucket of the Supabase project.
const mediaPattern = process.env.SUPABASE_URL ? new URL(`${process.env.SUPABASE_URL}/storage/v1/object/public/media/**`) : null

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    qualities: [75, 85],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: mediaPattern ? [mediaPattern] : [],
    // Lets a local Supabase (127.0.0.1) serve images during development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
  },
  experimental: {
    // Images are compressed in the browser before upload; 4 MB also stays under Vercel's 4.5 MB body cap.
    serverActions: { bodySizeLimit: '4mb' },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
