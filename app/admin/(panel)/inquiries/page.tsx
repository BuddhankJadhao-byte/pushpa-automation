import { Mail, MessageCircle, Phone } from 'lucide-react'
import { requireAdmin } from '@/lib/supabase/server'
import { deleteClosedInquiries, deleteInquiry, setInquiryStatus } from '@/app/admin/actions'
import { telLink, whatsappLink } from '@/lib/content'
import { PageHeader } from '@/components/admin/shell'
import { DeleteButton, SubmitButton } from '@/components/admin/ui'
import { StatusSelect } from '@/components/admin/status-select'

type Inquiry = { id: string; name: string; phone: string; email: string; topic: string; message: string; source: string; status: string; created_at: string }

export default async function InquiriesPage() {
  const db = await requireAdmin()
  const { data } = await db.from('inquiries').select('*').order('created_at', { ascending: false }).limit(200)
  const inquiries = (data ?? []) as Inquiry[]
  const closed = inquiries.filter((q) => q.status === 'closed').length

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages from the website’s contact form and estimator. Personal details — delete them once the job is closed."
        action={
          closed > 0 && (
            <form action={deleteClosedInquiries}>
              <SubmitButton danger>Delete {closed} closed</SubmitButton>
            </form>
          )
        }
      />
      {inquiries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No enquiries yet.</p>
      ) : (
        <ul className="space-y-4">
          {inquiries.map((q) => {
            const digits = q.phone.replace(/\D/g, '')
            const wa = digits.length === 10 ? `91${digits}` : digits
            return (
              <li key={q.id} className={`rounded-2xl border bg-surface p-5 ${q.status === 'new' ? 'border-accent/50' : 'border-line'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{q.name}</p>
                    <p className="text-sm text-subtle">
                      {q.topic} · {q.source === 'estimate' ? 'from the estimator' : 'contact form'} ·{' '}
                      {new Date(q.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>
                  <StatusSelect id={q.id} status={q.status} action={setInquiryStatus} />
                </div>
                <p className="mt-4 whitespace-pre-line rounded-xl bg-canvas p-4 text-sm leading-relaxed">{q.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <a href={telLink(q.phone)} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 hover:border-accent">
                    <Phone className="size-3.5" aria-hidden /> {q.phone}
                  </a>
                  {wa.length >= 10 && (
                    <a
                      href={whatsappLink(wa, `Hello ${q.name}, this is Pushpa Automation regarding your enquiry about ${q.topic}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 hover:border-live"
                    >
                      <MessageCircle className="size-3.5 text-live" aria-hidden /> WhatsApp
                    </a>
                  )}
                  {q.email && (
                    <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 hover:border-accent">
                      <Mail className="size-3.5" aria-hidden /> {q.email}
                    </a>
                  )}
                  <span className="ml-auto">
                    <DeleteButton action={deleteInquiry} fields={{ id: q.id }} />
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
