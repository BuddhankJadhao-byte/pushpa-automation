import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/shell'

export const metadata: Metadata = {
  title: 'Owner dashboard',
  robots: { index: false, follow: false },
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const db = await requireAdmin()
  const { count } = await db.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new')
  return <AdminShell newInquiries={count ?? 0}>{children}</AdminShell>
}
