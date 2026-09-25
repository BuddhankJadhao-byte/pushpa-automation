import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/server'
import { PageHeader } from '@/components/admin/shell'
import { ContentList, EmptyState } from '@/components/admin/content-list'

export default async function ProjectsPage() {
  const db = await requireAdmin()
  const { data } = await db
    .from('projects')
    .select('id, title, location, year, image, published')
    .order('position')
    .order('created_at', { ascending: false })
  const items = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: [p.location, p.year].filter(Boolean).join(' · ') || 'No location yet',
    image: p.image,
    published: p.published,
  }))

  return (
    <>
      <PageHeader
        title="Our work"
        description="Photos and stories of panels you have delivered. The “Our work” section appears on the website once you add the first one."
        action={
          <Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-canvas active:scale-[0.97]">
            <Plus className="size-4" aria-hidden /> Add project
          </Link>
        }
      />
      {items.length ? (
        <ContentList table="projects" items={items} />
      ) : (
        <EmptyState title="Show customers your real work">
          <Link href="/admin/projects/new" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-canvas">
            Add your first project
          </Link>
        </EmptyState>
      )}
    </>
  )
}
