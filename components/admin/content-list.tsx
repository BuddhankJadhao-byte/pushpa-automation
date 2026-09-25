'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Eye, EyeOff, ImageOff, Pencil } from 'lucide-react'
import { deleteContent, setPublished } from '@/app/admin/actions'
import { DeleteButton } from './ui'

export type ListItem = { id: string; title: string; subtitle: string; image?: string | null; published: boolean }

export function ContentList({
  table,
  items,
  withImages = true,
}: {
  table: 'products' | 'projects' | 'reviews'
  items: ListItem[]
  withImages?: boolean
}) {
  return (
    <motion.ul
      className="space-y-3"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          layout
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-3 pr-4 sm:flex-nowrap"
        >
          {withImages && (
            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-raised">
              {item.image ? (
                <img src={item.image} alt="" className="size-full object-cover" loading="lazy" />
              ) : (
                <ImageOff className="size-5 text-subtle" aria-hidden />
              )}
            </span>
          )}
          <Link href={`/admin/${table}/${item.id}`} className="min-w-0 flex-1 pl-1">
            <span className="block truncate font-medium">{item.title}</span>
            <span className="block truncate text-sm text-subtle">{item.subtitle}</span>
          </Link>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <form action={setPublished}>
              <input type="hidden" name="table" value={table} />
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="published" value={String(!item.published)} />
              <button
                type="submit"
                title={item.published ? 'Visible on the website — click to hide' : 'Hidden — click to show on the website'}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${item.published ? 'bg-live/15 text-live' : 'bg-white/5 text-subtle'}`}
              >
                {item.published ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                {item.published ? 'Live' : 'Hidden'}
              </button>
            </form>
            <Link href={`/admin/${table}/${item.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent">
              <Pencil className="size-3.5" aria-hidden /> Edit
            </Link>
            <DeleteButton action={deleteContent} fields={{ table, id: item.id }} />
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}

export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}
