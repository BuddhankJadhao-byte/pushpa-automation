import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSessionClient, supabaseConfig } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Owner login', robots: { index: false, follow: false } }

export default async function LoginPage() {
  if (supabaseConfig()) {
    const db = await createSessionClient()
    const { data: isOwner } = await db.rpc('is_admin')
    if (isOwner === true) redirect('/admin')
  }
  return (
    <main className="bg-blueprint relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden className="absolute left-1/2 top-1/3 -z-10 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[110px]" />
      <LoginForm configured={!!supabaseConfig()} />
    </main>
  )
}
