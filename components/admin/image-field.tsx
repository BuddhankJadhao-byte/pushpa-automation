'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ImagePlus, Loader2 } from 'lucide-react'

const MAX_EDGE = 2000

/**
 * Re-encodes a photo in the browser: max 2000 px, WebP (JPEG fallback). Phone photos
 * shrink from ~5 MB to a few hundred KB, and GPS/EXIF metadata is stripped.
 */
async function compress(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85))
  let blob = await encode('image/webp')
  if (!blob || blob.type !== 'image/webp') blob = await encode('image/jpeg')
  if (!blob) throw new Error('encode failed')
  return new File([blob], `photo.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`, { type: blob.type })
}

export function ImageField({ current, error, label = 'Photo' }: { current: string | null; error?: string; label?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(current)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
  }, [preview])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setBusy(true)
    setNote(null)
    try {
      const small = await compress(picked)
      const list = new DataTransfer()
      list.items.add(small)
      e.target.files = list.files
      setPreview(URL.createObjectURL(small))
      setNote(`Optimised to ${Math.max(1, Math.round(small.size / 1024))} KB`)
    } catch {
      // Unusual formats: upload as-is; the server still checks type and size.
      setPreview(URL.createObjectURL(picked))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <label
        className={`group relative flex aspect-[16/10] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors ${
          error ? 'border-alert' : 'border-line-strong hover:border-accent'
        }`}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.img
              key={preview}
              src={preview}
              alt=""
              className="absolute inset-0 size-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.span key="empty" className="flex flex-col items-center gap-2 text-sm text-subtle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ImagePlus className="size-8 transition-transform duration-300 group-hover:scale-110" aria-hidden />
              Tap to choose a photo
            </motion.span>
          )}
        </AnimatePresence>
        {preview && (
          <span className="absolute bottom-3 right-3 rounded-full bg-canvas/80 px-3 py-1.5 text-xs font-medium backdrop-blur">Change photo</span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-canvas/70">
            <Loader2 className="size-6 animate-spin text-accent" aria-hidden />
          </span>
        )}
        <input ref={input} type="file" name="image" accept="image/*" onChange={onPick} className="sr-only" aria-label={`${label} upload`} />
      </label>
      {error ? <p className="mt-1.5 text-sm text-alert">{error}</p> : note && <p className="mt-1.5 text-xs text-live">{note}</p>}
      {current && (
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="removeImage" className="size-4 accent-[var(--color-alert)]" /> Remove the current photo
        </label>
      )}
    </div>
  )
}
