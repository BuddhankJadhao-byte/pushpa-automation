import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const BUCKET = 'media'

// Identify images by their first bytes — never trust the file name or the browser's MIME type.
function sniff(bytes: Uint8Array): { ext: string; type: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to))
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' }
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG') return { ext: 'png', type: 'image/png' }
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', type: 'image/webp' }
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return { ext: 'avif', type: 'image/avif' }
  return null
}

function publicPrefix() {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
}

export type UploadResult = { url: string } | { error: string }

/** Validates and stores an owner upload under a random name. Returns its public URL. */
export async function uploadImage(db: SupabaseClient, file: File, folder: 'products' | 'projects'): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) return { error: 'Image is larger than 4 MB. Please choose a smaller photo.' }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniff(bytes)
  if (!kind) return { error: 'Only JPG, PNG, WebP or AVIF images can be uploaded.' }

  const path = `${folder}/${crypto.randomUUID()}.${kind.ext}`
  const { error } = await db.storage.from(BUCKET).upload(path, bytes, {
    contentType: kind.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) {
    console.error('upload failed', error.message)
    return { error: 'The image could not be uploaded. Please try again.' }
  }
  return { url: publicPrefix() + path }
}

/** Deletes an image this site uploaded. Starter images and anything else are left alone. */
export async function removeImage(db: SupabaseClient, url: string | null | undefined) {
  if (!url?.startsWith(publicPrefix())) return
  const path = url.slice(publicPrefix().length)
  if (!/^(products|projects)\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/.test(path)) return
  const { error } = await db.storage.from(BUCKET).remove([path])
  if (error) console.error('image cleanup failed', error.message)
}
