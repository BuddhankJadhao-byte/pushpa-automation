'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSessionClient, requireAdmin } from '@/lib/supabase/server'
import { CONTENT_TAG } from '@/lib/data'
import { removeImage, uploadImage } from '@/lib/media'
import { STARTER_PRODUCTS, STARTER_REVIEWS } from '@/lib/content'
import {
  fieldErrors,
  idSchema,
  inquiryStatusSchema,
  productSchema,
  projectSchema,
  reviewSchema,
  settingsSchema,
} from '@/lib/schemas'

// Every action below re-checks the owner session first (requireAdmin) and then runs
// under the owner's own database session, so Row Level Security applies a second time.

export type FormState = { message?: string; errors?: Record<string, string> }

const CONTENT = {
  products: { schema: productSchema, folder: 'products', path: '/admin/products' },
  projects: { schema: projectSchema, folder: 'projects', path: '/admin/projects' },
  reviews: { schema: reviewSchema, folder: null, path: '/admin/reviews' },
} as const
type ContentTable = keyof typeof CONTENT
const tableSchema = z.enum(['products', 'projects', 'reviews'])

function publish() {
  // The public site shows the change on its very next request.
  revalidateTag(CONTENT_TAG, { expire: 0 })
}

function formObject(form: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, form.get(k) ?? undefined]))
}

async function saveContent(table: ContentTable, form: FormData): Promise<FormState> {
  const db = await requireAdmin()
  const { schema, folder, path } = CONTENT[table]
  const parsed = schema.safeParse(formObject(form, Object.keys(schema.shape)))
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Please fix the highlighted fields.' }

  const rawId = String(form.get('id') ?? '')
  const id = rawId ? idSchema.safeParse(rawId) : null
  if (id && !id.success) return { message: 'This item no longer exists.' }

  const row: Record<string, unknown> = { ...parsed.data }
  let previousImage: string | null = null

  if (folder) {
    // The current image is read from the database, never from the form.
    if (id?.success) {
      const { data } = await db.from(table).select('image').eq('id', id.data).maybeSingle()
      previousImage = (data?.image as string | null) ?? null
    }
    const file = form.get('image')
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadImage(db, file, folder)
      if ('error' in uploaded) return { errors: { image: uploaded.error }, message: uploaded.error }
      row.image = uploaded.url
    } else if (form.get('removeImage') === 'on') {
      row.image = null
    }
  }

  const { error } = id?.success
    ? await db.from(table).update(row).eq('id', id.data)
    : await db.from(table).insert(row)
  if (error) {
    console.error(`save ${table} failed`, error.code)
    if (typeof row.image === 'string') await removeImage(db, row.image)
    return { message: 'Could not save. Please try again.' }
  }
  if ('image' in row && previousImage !== row.image) await removeImage(db, previousImage)

  publish()
  redirect(`${path}?saved=1`)
}

export async function saveProduct(_: FormState, form: FormData) {
  return saveContent('products', form)
}
export async function saveProject(_: FormState, form: FormData) {
  return saveContent('projects', form)
}
export async function saveReview(_: FormState, form: FormData) {
  return saveContent('reviews', form)
}

export async function deleteContent(form: FormData) {
  const db = await requireAdmin()
  const table = tableSchema.parse(form.get('table'))
  const id = idSchema.parse(form.get('id'))
  const hasImage = CONTENT[table].folder !== null
  const { data } = hasImage ? await db.from(table).select('image').eq('id', id).maybeSingle() : { data: null }
  const { error } = await db.from(table).delete().eq('id', id)
  if (error) throw new Error('Delete failed')
  if (data?.image) await removeImage(db, data.image as string)
  publish()
  redirect(`${CONTENT[table].path}?deleted=1`)
}

export async function setPublished(form: FormData) {
  const db = await requireAdmin()
  const table = tableSchema.parse(form.get('table'))
  const id = idSchema.parse(form.get('id'))
  const published = form.get('published') === 'true'
  const { error } = await db.from(table).update({ published }).eq('id', id)
  if (error) throw new Error('Update failed')
  publish()
  redirect(CONTENT[table].path)
}

export async function importStarter(form: FormData) {
  const db = await requireAdmin()
  const kind = z.enum(['products', 'reviews']).parse(form.get('kind'))
  const { count } = await db.from(kind).select('id', { count: 'exact', head: true })
  if (!count) {
    const rows: Record<string, unknown>[] =
      kind === 'products'
        ? STARTER_PRODUCTS.map(({ id: _id, ...p }, position) => ({ ...p, position }))
        : STARTER_REVIEWS.map(({ id: _id, ...r }, position) => ({ ...r, position }))
    const { error } = await db.from(kind).insert(rows)
    if (error) throw new Error('Import failed')
    publish()
  }
  redirect(`/admin/${kind}`)
}

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  const db = await requireAdmin()
  const parsed = settingsSchema.safeParse({
    ...formObject(form, Object.keys(settingsSchema.shape).filter((k) => k !== 'openDays')),
    openDays: form.getAll('openDays'),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: 'Please fix the highlighted fields.' }
  const { error } = await db.from('site_settings').upsert({ id: 1, data: parsed.data })
  if (error) {
    console.error('save settings failed', error.code)
    return { message: 'Could not save. Please try again.' }
  }
  publish()
  redirect('/admin/settings?saved=1')
}

export async function setInquiryStatus(form: FormData) {
  const db = await requireAdmin()
  const id = idSchema.parse(form.get('id'))
  const status = inquiryStatusSchema.parse(form.get('status'))
  const { error } = await db.from('inquiries').update({ status }).eq('id', id)
  if (error) throw new Error('Update failed')
  redirect('/admin/inquiries')
}

export async function deleteInquiry(form: FormData) {
  const db = await requireAdmin()
  const id = idSchema.parse(form.get('id'))
  const { error } = await db.from('inquiries').delete().eq('id', id)
  if (error) throw new Error('Delete failed')
  redirect('/admin/inquiries?deleted=1')
}

export async function deleteClosedInquiries() {
  const db = await requireAdmin()
  const { error } = await db.from('inquiries').delete().eq('status', 'closed')
  if (error) throw new Error('Delete failed')
  redirect('/admin/inquiries?deleted=1')
}

export async function signOut() {
  const db = await createSessionClient()
  await db.auth.signOut()
  redirect('/admin/login')
}
