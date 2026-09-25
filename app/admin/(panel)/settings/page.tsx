import { requireAdmin } from '@/lib/supabase/server'
import { DEFAULT_SETTINGS } from '@/lib/content'
import { settingsSchema } from '@/lib/schemas'
import { PageHeader } from '@/components/admin/shell'
import { SettingsForm } from '@/components/admin/forms'

export default async function SettingsPage() {
  const db = await requireAdmin()
  const { data } = await db.from('site_settings').select('data').eq('id', 1).maybeSingle()
  const saved = settingsSchema.partial().safeParse(data?.data ?? {})
  const settings = { ...DEFAULT_SETTINGS, ...(saved.success ? saved.data : {}) }

  return (
    <>
      <PageHeader title="Settings" description="Contact details, opening hours and the numbers shown across the website." />
      <SettingsForm settings={settings} />
    </>
  )
}
