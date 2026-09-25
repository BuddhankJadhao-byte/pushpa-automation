import { z } from 'zod'

// Every write to the database passes through one of these schemas first.
// The database repeats the length limits as CHECK constraints (defence in depth).

const text = (max: number) => z.string().trim().max(max)
const required = (min: number, max: number) => z.string().trim().min(min).max(max)

const lines = (maxItems: number, maxLen: number) =>
  z
    .string()
    .max(maxItems * (maxLen + 2))
    .transform((v) => v.split('\n').map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(maxLen)).max(maxItems))

const csv = (maxItems: number, maxLen: number) =>
  z
    .string()
    .max(maxItems * (maxLen + 2))
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(maxLen)).max(maxItems))

const position = z.coerce.number().int().min(0).max(9999).catch(0)
const checkbox = z.string().optional().transform((v) => v === 'on')
const httpsUrl = z.url({ protocol: /^https$/ }).max(500)

export const productSchema = z.object({
  name: required(2, 120),
  category: required(2, 60),
  price: text(60),
  summary: text(600),
  specs: lines(20, 200),
  tags: csv(8, 40),
  oem: text(80),
  published: checkbox,
  position,
})

export const projectSchema = z.object({
  title: required(2, 120),
  client: text(120),
  location: text(120),
  year: text(20),
  summary: text(1000),
  tags: csv(8, 40),
  published: checkbox,
  position,
})

export const reviewSchema = z.object({
  author: required(2, 80),
  role: text(120),
  rating: z.coerce.number().int().min(1).max(5),
  body: required(10, 1000),
  published: checkbox,
  position,
})

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')

export const settingsSchema = z.object({
  phone: required(6, 30).regex(/^[+\d\s()-]+$/, 'Digits, spaces and + only'),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/, 'Country code + number, digits only (e.g. 917972741546)'),
  email: z.email().max(120),
  address: required(5, 300),
  opensAt: time,
  closesAt: time,
  openDays: z.array(z.coerce.number().int().min(0).max(6)).max(7),
  mapsUrl: httpsUrl,
  youtubeUrl: z.union([z.literal(''), httpsUrl]),
  statPanels: text(12),
  statRating: text(12),
  statReviews: text(12),
  statDispatch: text(16),
  announcement: text(160),
})

export const inquirySchema = z.object({
  name: required(2, 80),
  phone: z.string().trim().min(7).max(20).regex(/^[+\d\s()-]+$/, 'Enter a valid phone number'),
  email: z.union([z.literal(''), z.email().max(120)]),
  topic: required(2, 60),
  message: required(5, 2000),
  source: z.enum(['contact', 'estimate']),
})

export const inquiryStatusSchema = z.enum(['new', 'contacted', 'closed'])
export const idSchema = z.uuid()

/** First error message per field, for showing next to the inputs. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
