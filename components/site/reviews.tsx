'use client'

import { ArrowUpRight, Quote, Star } from 'lucide-react'
import { CountUp, Reveal } from '@/components/motion/primitives'
import type { Review, Settings } from '@/lib/content'
import { SectionHeading } from './section-heading'

function Stars({ rating, size = 'size-4' }: { rating: number; size?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${size} ${i < rating ? 'fill-accent text-accent' : 'text-line-strong'}`} aria-hidden />
      ))}
    </span>
  )
}

function ReviewCard({ review, hidden }: { review: Review; hidden?: boolean }) {
  const initials = review.author
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="flex w-[340px] shrink-0 flex-col justify-between gap-8 rounded-3xl border border-line bg-surface p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong sm:w-[400px]"
    >
      <div>
        <div className="flex items-center justify-between">
          <Stars rating={review.rating} />
          <Quote className="size-7 text-accent/30" aria-hidden />
        </div>
        <blockquote className="mt-5 text-[17px] leading-relaxed text-fg/90">“{review.body}”</blockquote>
      </div>
      <figcaption className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent">
          {initials}
        </span>
        <span>
          <span className="block font-semibold">{review.author}</span>
          {review.role && <span className="block text-sm text-subtle">{review.role}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

export function Reviews({ reviews, settings }: { reviews: Review[]; settings: Settings }) {
  if (reviews.length === 0) return null
  const loop = reviews.length >= 3

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="overflow-hidden py-28 sm:py-36">
      <div className="container-x flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <SectionHeading
          id="reviews-title"
          index="07"
          eyebrow="Client reviews"
          title="Trusted by plant heads and engineers."
        />
        <Reveal className="flex items-center gap-6">
          <p className="font-display text-7xl font-bold tracking-tight [font-stretch:110%]">
            <CountUp value={settings.statRating} />
          </p>
          <div>
            <Stars rating={5} size="size-5" />
            <p className="mt-2 text-sm text-muted">{settings.statReviews} verified Google reviews</p>
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Read them on Google <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>

      {loop ? (
        <div className="group mt-16 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
          <div
            className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused]"
            style={{ '--marquee-duration': `${reviews.length * 11}s` } as React.CSSProperties}
          >
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
            {reviews.map((r) => (
              <ReviewCard key={`${r.id}-copy`} review={r} hidden />
            ))}
          </div>
        </div>
      ) : (
        <div className="container-x mt-16 flex flex-wrap gap-5">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  )
}
