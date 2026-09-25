'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { ExternalLink, FolderKanban, Inbox, LayoutDashboard, LogOut, MessageSquareQuote, Package, Settings } from 'lucide-react'
import { signOut } from '@/app/admin/actions'
import { Logo } from '@/components/site/logo'
import { Flash } from './ui'

const NAV = [
  { href: '/admin', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', short: 'Products', icon: Package },
  { href: '/admin/projects', label: 'Our work', short: 'Work', icon: FolderKanban },
  { href: '/admin/reviews', label: 'Reviews', short: 'Reviews', icon: MessageSquareQuote },
  { href: '/admin/inquiries', label: 'Enquiries', short: 'Enquiries', icon: Inbox },
  { href: '/admin/settings', label: 'Settings', short: 'Settings', icon: Settings },
]

export function AdminShell({ children, newInquiries }: { children: React.ReactNode; newInquiries: number }) {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <Flash />
      <aside className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:flex-col lg:items-stretch lg:gap-8 lg:px-5 lg:py-7">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo className="h-8 w-auto text-fg" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Owner</span>
          </Link>
          <nav aria-label="Admin" className="hidden lg:block">
            <ul className="space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <li key={href} className="relative">
                  {isActive(href) && (
                    <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white/[0.07]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                  )}
                  <Link
                    href={href}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive(href) ? 'text-fg' : 'text-muted hover:text-fg'}`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                    {href === '/admin/inquiries' && newInquiries > 0 && (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-canvas">{newInquiries}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2 lg:mt-auto lg:flex-col lg:items-stretch">
            <a href="/" target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-fg">
              <ExternalLink className="size-4" aria-hidden /> <span className="hidden sm:inline">View website</span>
            </a>
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-alert">
                <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="px-4 pb-28 pt-6 sm:px-8 lg:px-12 lg:pb-16 lg:pt-10">
        <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
          {children}
        </motion.div>
      </main>

      {/* Phone tab bar */}
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-6">
          {NAV.map(({ href, short, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] ${isActive(href) ? 'text-accent' : 'text-subtle'}`}>
                {isActive(href) && <motion.span layoutId="admin-tab" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-accent" />}
                <Icon className="size-5" aria-hidden />
                {short}
                {href === '/admin/inquiries' && newInquiries > 0 && <span className="absolute right-[22%] top-1.5 size-2 rounded-full bg-accent" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight [font-stretch:108%] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
