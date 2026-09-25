import type { MetadataRoute } from 'next'
import { getSiteContent } from '@/lib/data'
import { SITE_URL } from '@/lib/site'

// Rebuilt on request so products and projects the owner adds appear immediately.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, projects } = await getSiteContent()
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, changeFrequency: 'yearly' as const, priority: 0.6 })),
    { url: `${SITE_URL}/llms.txt`, changeFrequency: 'weekly', priority: 0.3 },
  ]
}
