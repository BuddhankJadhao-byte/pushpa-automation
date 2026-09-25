import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/server'
import { idSchema } from '@/lib/schemas'
import { PageHeader } from '@/components/admin/shell'
import { ReviewForm } from '@/components/admin/forms'

export default async function EditReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await requireAdmin()

  if (id === 'new') {
    return (
      <>
        <PageHeader title="Add a review" />
        <ReviewForm review={null} />
      </>
    )
  }

  if (!idSchema.safeParse(id).success) notFound()
  const { data: review } = await db.from('reviews').select('*').eq('id', id).maybeSingle()
  if (!review) notFound()

  return (
    <>
      <PageHeader title="Edit review" description={review.author} />
      <ReviewForm review={review} />
    </>
  )
}
