import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Search engines and AI assistants (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) may read
// everything public; only the owner panel is off limits.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
