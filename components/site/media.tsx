import Image from 'next/image'
import { ImageOff } from 'lucide-react'

/** Owner-uploaded or starter image, filling its (relative, sized) parent. */
export function Media({ src, alt, sizes, className = '' }: { src: string | null; alt: string; sizes: string; className?: string }) {
  if (!src) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-raised text-subtle ${className}`}>
        <ImageOff className="size-8" aria-hidden />
      </div>
    )
  }
  return <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />
}
