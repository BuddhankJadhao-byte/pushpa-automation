import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/data'
import { breadcrumbLd, projectLd } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { SiteChrome } from '@/components/site/chrome'
import { ProjectPage } from '@/components/site/detail-pages'

type Props = { params: Promise<{ slug: string }> }

async function find(slug: string) {
  const content = await getSiteContent()
  return { content, project: content.projects.find((p) => p.slug === slug) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await find((await params).slug)
  if (!project) return { title: 'Project not found' }
  const description =
    project.summary.slice(0, 300) ||
    `${project.title}${project.location ? `, ${project.location}` : ''} — a project by Pushpa Automation & Robotics Industries, Pune.`
  return {
    title: project.title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      type: 'article',
      ...(project.image ? { images: [{ url: project.image, alt: project.title }] } : {}),
    },
  }
}

export default async function Page({ params }: Props) {
  const { content, project } = await find((await params).slug)
  if (!project) notFound()
  const others = content.projects.filter((p) => p.id !== project.id).slice(0, 3)

  return (
    <>
      <SiteChrome content={content}>
        <ProjectPage project={project} others={others} settings={content.settings} />
      </SiteChrome>
      <JsonLd
        data={[
          projectLd(project),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Our work', path: '/#work' },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />
    </>
  )
}
