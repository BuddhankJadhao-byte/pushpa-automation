import 'server-only'
import { unstable_cache } from 'next/cache'
import { createPublicClient, supabaseConfig } from '@/lib/supabase/server'
import { DEFAULT_SETTINGS, STARTER_CONTENT, type SiteContent } from '@/lib/content'
import { settingsSchema } from '@/lib/schemas'

export const CONTENT_TAG = 'site-content'

const PRODUCT_COLUMNS = 'id, slug, name, category, price, summary, specs, tags, oem, image'
const PROJECT_COLUMNS = 'id, slug, title, client, location, year, summary, tags, image'
const REVIEW_COLUMNS = 'id, author, role, rating, body'

async function loadContent(): Promise<SiteContent> {
  const db = createPublicClient()
  const [settings, products, projects, reviews] = await Promise.all([
    db.from('site_settings').select('data').eq('id', 1).maybeSingle(),
    db.from('products').select(PRODUCT_COLUMNS).eq('published', true).order('position').order('created_at'),
    db.from('projects').select(PROJECT_COLUMNS).eq('published', true).order('position').order('created_at', { ascending: false }),
    db.from('reviews').select(REVIEW_COLUMNS).eq('published', true).order('position').order('created_at'),
  ])
  const failed = [settings, products, projects, reviews].find((r) => r.error)
  // Throwing keeps the last good cached copy on screen instead of caching an outage.
  if (failed?.error) {
    const raw = failed.error.message || ''
    const msg = raw.startsWith('<') ? 'Upstream endpoint returned HTML instead of JSON data' : raw
    throw new Error(`Content query failed: ${msg}`)
  }

  const saved = settingsSchema.partial().safeParse(settings.data?.data ?? {})
  return {
    settings: { ...DEFAULT_SETTINGS, ...(saved.success ? saved.data : {}) },
    products: (products.data ?? []).map(withSafeImage),
    projects: (projects.data ?? []).map(withSafeImage),
    reviews: reviews.data ?? [],
  }
}

/** Only our own storage bucket or bundled /images may reach <Image>; anything else would crash the page. */
function withSafeImage<T extends { image: string | null }>(row: T): T {
  const config = supabaseConfig()
  const mediaPrefix = config ? `${config.url}/storage/v1/object/public/media/` : null
  const ok =
    row.image &&
    (/^\/images\/[\w-]+\.(jpe?g|png|webp|avif)$/.test(row.image) || (mediaPrefix && row.image.startsWith(mediaPrefix)))
  return ok ? row : { ...row, image: null }
}

const cachedContent = unstable_cache(loadContent, ['site-content-v1'], { tags: [CONTENT_TAG], revalidate: 3600 })

/** Everything the public site renders. Starter content until Supabase is connected or on cold cache failure. */
export async function getSiteContent(): Promise<SiteContent> {
  if (!supabaseConfig()) return STARTER_CONTENT
  try {
    return await cachedContent()
  } catch (err) {
    console.error('Failed to load content from database, serving starter fallback:', err instanceof Error ? err.message : String(err))
    return STARTER_CONTENT
  }
}
