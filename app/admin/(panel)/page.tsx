import Link from 'next/link'
import { ArrowRight, FolderKanban, Inbox, MessageSquareQuote, Package, Plus } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/server'
import { PageHeader } from '@/components/admin/shell'

export default async function Dashboard() {
  const db = await requireAdmin()
  const count = (table: string) => db.from(table).select('id', { count: 'exact', head: true })
  const [products, projects, reviews, fresh, recent] = await Promise.all([
    count('products'),
    count('projects'),
    count('reviews'),
    count('inquiries').eq('status', 'new'),
    db.from('inquiries').select('id, name, topic, created_at, status').order('created_at', { ascending: false }).limit(5),
  ])

  const tiles = [
    { label: 'Products', value: products.count ?? 0, href: '/admin/products', icon: Package },
    { label: 'Projects', value: projects.count ?? 0, href: '/admin/projects', icon: FolderKanban },
    { label: 'Reviews', value: reviews.count ?? 0, href: '/admin/reviews', icon: MessageSquareQuote },
    { label: 'New enquiries', value: fresh.count ?? 0, href: '/admin/inquiries', icon: Inbox, highlight: (fresh.count ?? 0) > 0 },
  ]

  return (
    <>
      <PageHeader title="Welcome back" description="Everything on the website is managed from here. Changes appear on the site as soon as you save." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, href, icon: Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`group rounded-2xl border p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 ${highlight ? 'border-accent/60 bg-accent/[0.06]' : 'border-line bg-surface hover:border-line-strong'}`}
          >
            <Icon className={`size-5 ${highlight ? 'text-accent' : 'text-subtle'}`} aria-hidden />
            <p className="mt-4 font-display text-4xl font-bold tabular-nums">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              {label} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Latest enquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-accent hover:underline">
              See all
            </Link>
          </div>
          {recent.data?.length ? (
            <ul className="mt-4 divide-y divide-line">
              {recent.data.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{q.name}</span>
                    <span className="block truncate text-sm text-subtle">{q.topic}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-subtle">
                    {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}
                    {q.status === 'new' && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-semibold text-canvas">New</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-subtle">No enquiries yet. They will appear here as soon as someone uses the contact form.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Quick add</h2>
          <div className="mt-4 grid gap-2">
            {[
              ['/admin/products/new', 'Add a product'],
              ['/admin/projects/new', 'Add a finished project'],
              ['/admin/reviews/new', 'Add a client review'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-line-strong px-4 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
                <Plus className="size-4" aria-hidden /> {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
