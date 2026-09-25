import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/server'
import { idSchema } from '@/lib/schemas'
import { PageHeader } from '@/components/admin/shell'
import { ProductForm } from '@/components/admin/forms'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await requireAdmin()
  const { data: rows } = await db.from('products').select('category')
  const categories = [...new Set((rows ?? []).map((r) => r.category as string))]

  if (id === 'new') {
    return (
      <>
        <PageHeader title="Add a product" description="Fill in what customers should see. Only the name and category are required." />
        <ProductForm product={null} categories={categories} />
      </>
    )
  }

  if (!idSchema.safeParse(id).success) notFound()
  const { data: product } = await db.from('products').select('*').eq('id', id).maybeSingle()
  if (!product) notFound()

  return (
    <>
      <PageHeader
        title="Edit product"
        description={product.name}
        action={
          <a href={`/products/${product.slug}`} target="_blank" rel="noopener" className="text-sm text-accent hover:underline">
            View on website ↗
          </a>
        }
      />
      <ProductForm product={product} categories={categories} />
    </>
  )
}
