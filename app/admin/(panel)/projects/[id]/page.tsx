import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/server'
import { idSchema } from '@/lib/schemas'
import { PageHeader } from '@/components/admin/shell'
import { ProjectForm } from '@/components/admin/forms'

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await requireAdmin()

  if (id === 'new') {
    return (
      <>
        <PageHeader title="Add a project" description="A good photo and two lines about the job are enough." />
        <ProjectForm project={null} />
      </>
    )
  }

  if (!idSchema.safeParse(id).success) notFound()
  const { data: project } = await db.from('projects').select('*').eq('id', id).maybeSingle()
  if (!project) notFound()

  return (
    <>
      <PageHeader
        title="Edit project"
        description={project.title}
        action={
          <a href={`/work/${project.slug}`} target="_blank" rel="noopener" className="text-sm text-accent hover:underline">
            View on website ↗
          </a>
        }
      />
      <ProjectForm project={project} />
    </>
  )
}
