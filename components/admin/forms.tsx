'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { saveProduct, saveProject, saveReview, saveSettings, type FormState } from '@/app/admin/actions'
import type { Product, Project, Review, Settings } from '@/lib/content'
import { Field, FormAlert, SubmitButton, Toggle, submitWith } from './ui'
import { ImageField } from './image-field'

type Row<T> = (T & { published: boolean; position: number }) | null

function Actions({ back, pending }: { back: string; pending: boolean }) {
  return (
    <div className="sticky bottom-20 z-10 flex items-center justify-end gap-3 rounded-2xl border border-line bg-canvas/85 p-3 backdrop-blur lg:bottom-4">
      <Link href={back} className="rounded-full px-5 py-3 text-sm text-muted hover:text-fg">
        Cancel
      </Link>
      <SubmitButton pending={pending}>Save and publish</SubmitButton>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <legend className="float-left mb-1 w-full font-display text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

export function ProductForm({ product, categories }: { product: Row<Product>; categories: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {})
  const e = state.errors ?? {}
  return (
    <form onSubmit={submitWith(action)} className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-5">
        <FormAlert message={state.message} />
        <Card title="Details">
          <Field label="Product name" name="name" defaultValue={product?.name} error={e.name} required maxLength={120} placeholder="e.g. PLC HMI Automated Control Panel" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" name="category" defaultValue={product?.category} error={e.category} required maxLength={60} list="categories" hint="Pick an existing one or type a new category" />
            <Field label="Price" name="price" defaultValue={product?.price} error={e.price} maxLength={60} placeholder="₹45,000" hint="Leave empty to show “On request”" />
          </div>
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Field label="Brands / OEM" name="oem" defaultValue={product?.oem} error={e.oem} maxLength={80} placeholder="Delta / Siemens" />
          <Field label="Short description" name="summary" defaultValue={product?.summary} error={e.summary} rows={3} maxLength={600} />
        </Card>
        <Card title="Specifications">
          <Field label="Specifications" name="specs" defaultValue={product?.specs.join('\n')} error={e.specs} rows={6} hint="One per line (up to 20)" />
          <Field label="Highlights" name="tags" defaultValue={product?.tags.join(', ')} error={e.tags} hint="Comma separated, e.g. IP65 CRCA, 415 V 3-phase, In stock" />
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="Photo">
          <ImageField current={product?.image ?? null} error={e.image} />
        </Card>
        <Card title="Visibility">
          <Toggle name="published" label="Show on website" defaultChecked={product?.published ?? true} />
          <Field label="Order" name="position" type="number" min={0} max={9999} defaultValue={product?.position ?? 0} hint="Lower numbers appear first" />
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Actions back="/admin/products" pending={pending} />
      </div>
    </form>
  )
}

export function ProjectForm({ project }: { project: Row<Project> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProject, {})
  const e = state.errors ?? {}
  return (
    <form onSubmit={submitWith(action)} className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="space-y-5">
        <FormAlert message={state.message} />
        <Card title="About the job">
          <Field label="Title" name="title" defaultValue={project?.title} error={e.title} required maxLength={120} placeholder="e.g. 40 HP VFD panel for a packaging line" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Client or industry" name="client" defaultValue={project?.client} error={e.client} maxLength={120} placeholder="e.g. Auto components plant" />
            <Field label="Location" name="location" defaultValue={project?.location} error={e.location} maxLength={120} placeholder="e.g. Chakan, Pune" />
          </div>
          <Field label="Year" name="year" defaultValue={project?.year} error={e.year} maxLength={20} placeholder="2026" />
          <Field label="What we did" name="summary" defaultValue={project?.summary} error={e.summary} rows={5} maxLength={1000} />
          <Field label="Tags" name="tags" defaultValue={project?.tags.join(', ')} error={e.tags} hint="Comma separated, e.g. VFD, Commissioning" />
        </Card>
      </div>
      <div className="space-y-5">
        <Card title="Photo">
          <ImageField current={project?.image ?? null} error={e.image} />
        </Card>
        <Card title="Visibility">
          <Toggle name="published" label="Show on website" defaultChecked={project?.published ?? true} />
          <Field label="Order" name="position" type="number" min={0} max={9999} defaultValue={project?.position ?? 0} hint="Lower numbers appear first" />
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Actions back="/admin/projects" pending={pending} />
      </div>
    </form>
  )
}

export function ReviewForm({ review }: { review: Row<Review> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveReview, {})
  const e = state.errors ?? {}
  return (
    <form onSubmit={submitWith(action)} className="max-w-2xl space-y-5">
      {review && <input type="hidden" name="id" value={review.id} />}
      <FormAlert message={state.message} />
      <Card title="Review">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="author" defaultValue={review?.author} error={e.author} required maxLength={80} />
          <Field label="Role or company" name="role" defaultValue={review?.role} error={e.role} maxLength={120} placeholder="Plant head, ABC Industries" />
        </div>
        <div>
          <label htmlFor="f-rating" className="mb-1.5 block text-sm font-medium text-muted">
            Rating
          </label>
          <select id="f-rating" name="rating" defaultValue={review?.rating ?? 5} className="w-full rounded-xl border border-line-strong bg-canvas px-4 py-3">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
        <Field label="What they said" name="body" defaultValue={review?.body} error={e.body} rows={5} required maxLength={1000} />
      </Card>
      <Card title="Visibility">
        <Toggle name="published" label="Show on website" defaultChecked={review?.published ?? true} />
        <Field label="Order" name="position" type="number" min={0} max={9999} defaultValue={review?.position ?? 0} hint="Lower numbers appear first" />
      </Card>
      <Actions back="/admin/reviews" pending={pending} />
    </form>
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {})
  const e = state.errors ?? {}
  return (
    <form onSubmit={submitWith(action)} className="max-w-3xl space-y-5">
      <FormAlert message={state.message} />
      <Card title="Contact details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone (shown on site)" name="phone" defaultValue={settings.phone} error={e.phone} required />
          <Field label="WhatsApp number" name="whatsapp" defaultValue={settings.whatsapp} error={e.whatsapp} required inputMode="numeric" hint="Country code + number, digits only" />
        </div>
        <Field label="Email" name="email" type="email" defaultValue={settings.email} error={e.email} required />
        <Field label="Address" name="address" defaultValue={settings.address} error={e.address} rows={2} required maxLength={300} />
        <Field label="Google Maps link" name="mapsUrl" type="url" defaultValue={settings.mapsUrl} error={e.mapsUrl} required />
        <Field label="YouTube channel link" name="youtubeUrl" type="url" defaultValue={settings.youtubeUrl} error={e.youtubeUrl} hint="Leave empty to hide" />
      </Card>
      <Card title="Working hours (India time)">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Opens at" name="opensAt" type="time" defaultValue={settings.opensAt} error={e.opensAt} required />
          <Field label="Closes at" name="closesAt" type="time" defaultValue={settings.closesAt} error={e.closesAt} required />
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d, i) => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" name="openDays" value={i} defaultChecked={settings.openDays.includes(i)} className="peer sr-only" />
              <span className="block rounded-xl border border-line-strong px-4 py-2 text-sm text-muted transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:font-semibold peer-checked:text-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                {d}
              </span>
            </label>
          ))}
        </div>
      </Card>
      <Card title="Numbers on the homepage">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Panels delivered" name="statPanels" defaultValue={settings.statPanels} error={e.statPanels} maxLength={12} />
          <Field label="Google rating" name="statRating" defaultValue={settings.statRating} error={e.statRating} maxLength={12} />
          <Field label="Number of reviews" name="statReviews" defaultValue={settings.statReviews} error={e.statReviews} maxLength={12} />
          <Field label="Typical dispatch time" name="statDispatch" defaultValue={settings.statDispatch} error={e.statDispatch} maxLength={16} />
        </div>
      </Card>
      <Card title="Announcement bar">
        <Field label="Message at the top of the site" name="announcement" defaultValue={settings.announcement} error={e.announcement} maxLength={160} hint="e.g. Closed on 15 August. Leave empty to hide." />
      </Card>
      <Actions back="/admin" pending={pending} />
    </form>
  )
}
