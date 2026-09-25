import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/server'
import { importStarter } from '@/app/admin/actions'
import { PageHeader } from '@/components/admin/shell'
import { ContentList, EmptyState } from '@/components/admin/content-list'
import { SubmitButton } from '@/components/admin/ui'

export default async function ProductsPage() {
  const db = await requireAdmin()
  const { data } = await db.from('products').select('id, name, category, price, image, published').order('position').order('created_at')
  const items = (data ?? []).map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: [p.category, p.price].filter(Boolean).join(' · '),
    image: p.image,
    published: p.published,
  }))

  return (
    <>
      <PageHeader
        title="Products"
        description="The panels and components shown in the catalogue."
        action={
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-canvas active:scale-[0.97]">
            <Plus className="size-4" aria-hidden /> Add product
          </Link>
        }
      />
      {items.length ? (
        <ContentList table="products" items={items} />
      ) : (
        <EmptyState title="No products yet">
          <form action={importStarter}>
            <input type="hidden" name="kind" value="products" />
            <SubmitButton>Import the 8 starter products</SubmitButton>
          </form>
          <Link href="/admin/products/new" className="rounded-full border border-line-strong px-5 py-3 text-sm">
            Add your own
          </Link>
        </EmptyState>
      )}
    </>
  )
}
