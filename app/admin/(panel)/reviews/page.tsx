import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/server'
import { importStarter } from '@/app/admin/actions'
import { PageHeader } from '@/components/admin/shell'
import { ContentList, EmptyState } from '@/components/admin/content-list'
import { SubmitButton } from '@/components/admin/ui'

export default async function ReviewsPage() {
  const db = await requireAdmin()
  const { data } = await db.from('reviews').select('id, author, role, rating, published').order('position').order('created_at')
  const items = (data ?? []).map((r) => ({
    id: r.id,
    title: r.author,
    subtitle: `${'★'.repeat(r.rating)}${r.role ? ` · ${r.role}` : ''}`,
    published: r.published,
  }))

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Client testimonials shown on the homepage. Copy them from Google reviews or add what clients tell you."
        action={
          <Link href="/admin/reviews/new" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-canvas active:scale-[0.97]">
            <Plus className="size-4" aria-hidden /> Add review
          </Link>
        }
      />
      {items.length ? (
        <ContentList table="reviews" items={items} withImages={false} />
      ) : (
        <EmptyState title="No reviews yet">
          <form action={importStarter}>
            <input type="hidden" name="kind" value="reviews" />
            <SubmitButton>Import the 3 existing reviews</SubmitButton>
          </form>
          <Link href="/admin/reviews/new" className="rounded-full border border-line-strong px-5 py-3 text-sm">
            Add a review
          </Link>
        </EmptyState>
      )}
    </>
  )
}
