import { useState } from 'react'
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import { aiApi, bookingApi, complaintApi } from '../api'
import { errorMessage } from '../api/client'
import { EmptyState, Loader } from '../components/States'
import { useAsync } from '../hooks/useAsync'
import { formatDateTime, titleCase } from '../utils/format'
import type { ComplaintClassificationResponse } from '../types'

export default function SupportPage() {
  const bookings = useAsync(() => bookingApi.mine({ size: 20 }), [])
  const complaints = useAsync(() => complaintApi.mine(), [])

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<ComplaintClassificationResponse | null>(null)

  async function previewClassification() {
    if (!subject.trim() || !description.trim()) return
    try {
      setSuggestion(await aiApi.classifyComplaint({ subject: subject.trim(), description: description.trim() }))
    } catch {
      // Classification is advisory only — silently skip if unavailable.
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await complaintApi.create({
        subject: subject.trim(),
        description: description.trim(),
        bookingId: bookingId ? Number(bookingId) : undefined,
      })
      setSubject('')
      setDescription('')
      setBookingId('')
      setSuggestion(null)
      complaints.reload()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
        <ShieldAlert className="h-6 w-6 text-brand-600" />
        Support and complaints
      </h1>
      <p className="muted mt-1">
        Your complaint is stored in MySQL with the status Open. An administrator reviews it, can classify it and records
        a resolution.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form className="card space-y-4 p-6" onSubmit={submit}>
          <div>
            <label className="label" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. Provider arrived very late"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="bookingId">
              Related booking (optional)
            </label>
            <select id="bookingId" className="input" value={bookingId} onChange={(event) => setBookingId(event.target.value)}>
              <option value="">Not linked to a booking</option>
              {(bookings.data?.content ?? []).map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.bookingRef} — {booking.serviceName}
                </option>
              ))}
            </select>
            <p className="muted mt-1">You can only attach a booking that belongs to your account.</p>
          </div>

          <div>
            <label className="label" htmlFor="description">
              What happened?
            </label>
            <textarea
              id="description"
              rows={5}
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => void previewClassification()}
              required
            />
          </div>

          {suggestion && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-ink-700">
              <p className="font-semibold">Suggested classification (advisory only)</p>
              <p className="mt-1">
                {titleCase(suggestion.suggestedCategory ?? 'OTHER')} · priority{' '}
                {suggestion.suggestedPriority ?? 'MEDIUM'} · mode {suggestion.mode}
              </p>
              <p className="mt-1">{suggestion.summary}</p>
              <p className="mt-1 italic">{suggestion.note}</p>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-start gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>
              No email or SMS is sent for complaints in this version — there is no notification provider configured, so
              updates appear in your in-app notifications.
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit complaint'}
          </button>
        </form>

        <section>
          <h2 className="text-sm font-semibold text-ink-900">My complaints</h2>
          <div className="mt-3 space-y-3">
            {complaints.loading && <Loader />}
            {complaints.data && complaints.data.length === 0 && (
              <EmptyState
                title="No complaints filed"
                description="If something goes wrong with a booking, submit a complaint here."
                icon={<AlertTriangle className="h-6 w-6" />}
              />
            )}
            {complaints.data?.map((complaint) => (
              <article key={complaint.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink-900">{complaint.subject}</p>
                  <span className="chip bg-ink-100 text-ink-600 ring-ink-200">{titleCase(complaint.status)}</span>
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-ink-600">{complaint.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink-400">
                  {complaint.category && <span>Category: {titleCase(complaint.category)}</span>}
                  {complaint.priority && <span>Priority: {complaint.priority}</span>}
                  {complaint.bookingRef && <span>Booking: {complaint.bookingRef}</span>}
                  <span>Filed {formatDateTime(complaint.createdAt)}</span>
                </div>
                {complaint.resolutionNote && (
                  <p className="mt-2 rounded-lg bg-brand-50 p-2 text-xs text-brand-800">
                    Resolution: {complaint.resolutionNote}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
