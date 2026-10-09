import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Star, UserRound } from 'lucide-react'
import { bookingApi, reviewApi } from '../api'
import { errorMessage } from '../api/client'
import { BookingStatusBadge } from '../components/StatusBadge'
import { ErrorState, Loader } from '../components/States'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { formatDate, formatDateTime, formatTime, inr } from '../utils/format'

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const id = Number(bookingId)
  const toast = useToast()
  const booking = useAsync(() => bookingApi.get(id), [id])

  const [cancelNote, setCancelNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function cancelBooking() {
    setBusy(true)
    setError(null)
    try {
      await bookingApi.cancel(id, cancelNote || undefined)
      toast.success('Booking cancelled.')
      booking.reload()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await reviewApi.create({ bookingId: id, rating, comment: comment || undefined })
      toast.success('Thanks — your review is published.')
      booking.reload()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  if (booking.loading) {
    return (
      <div className="container-page py-10">
        <Loader label="Loading booking…" />
      </div>
    )
  }

  if (booking.error || !booking.data) {
    return (
      <div className="container-page py-10">
        <ErrorState error={booking.error ?? { status: 404, error: 'Not found', message: 'Booking not found.' }} onRetry={booking.reload} />
      </div>
    )
  }

  const data = booking.data

  return (
    <div className="container-page py-8">
      <Link to="/bookings" className="muted hover:text-brand-700">
        ← All bookings
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-ink-900">{data.serviceName}</h1>
                <p className="muted mt-0.5">
                  {data.packageName} · Ref {data.bookingRef}
                </p>
              </div>
              <BookingStatusBadge status={data.status} />
            </div>

            <dl className="mt-4 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-ink-400" />
                {formatDate(data.bookingDate)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-400" />
                {formatTime(data.startTime)} – {formatTime(data.endTime)}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-4 w-4 text-ink-400" />
                {data.addressSummary}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <UserRound className="h-4 w-4 text-ink-400" />
                {data.providerName ? `Provider: ${data.providerName}` : 'No provider assigned yet'}
              </div>
            </dl>

            {data.customerNotes && (
              <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
                <span className="font-medium text-ink-700">Your notes: </span>
                {data.customerNotes}
              </p>
            )}
            {data.statusNote && <p className="mt-2 text-sm text-ink-500">Latest note: {data.statusNote}</p>}
          </div>

          {data.canReview && (
            <form className="card p-6" onSubmit={submitReview}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Star className="h-4 w-4 text-amber-500" />
                Leave a review
              </h2>
              <p className="muted mt-1">
                Reviews are only allowed for completed bookings, and only one review per booking.
              </p>

              <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                    className="p-1"
                  >
                    <Star
                      className={
                        value <= rating ? 'h-6 w-6 fill-amber-400 text-amber-400' : 'h-6 w-6 text-ink-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-ink-700">{rating}/5</span>
              </div>

              <textarea
                className="input mt-3"
                rows={3}
                placeholder="How did the service go?"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />

              <button type="submit" className="btn-primary mt-3" disabled={busy}>
                Publish review
              </button>
            </form>
          )}

          {data.hasReview && (
            <p className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
              You have already reviewed this booking. Thank you!
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Agreed price</p>
            <p className="text-3xl font-extrabold text-ink-900">{inr(data.agreedPrice)}</p>
            <p className="muted mt-1">Payment status: {data.paymentStatus}</p>
            <p className="mt-2 text-xs text-ink-400">
              Calculated by the server from the package price and stored on the booking as a snapshot.
            </p>
          </div>

          {data.canCancel && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Cancel this booking</h2>
              <p className="muted mt-1">
                Cancellation is allowed while the booking is Pending or Accepted and the date is not in the past.
              </p>
              <input
                className="input mt-3"
                placeholder="Reason (optional)"
                value={cancelNote}
                onChange={(event) => setCancelNote(event.target.value)}
              />
              <button type="button" className="btn-danger mt-3 w-full" onClick={() => void cancelBooking()} disabled={busy}>
                {busy ? 'Cancelling…' : 'Cancel booking'}
              </button>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Status history</h2>
            <ol className="mt-3 space-y-3">
              {data.statusHistory.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="relative border-l border-ink-200 pl-4">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <p className="text-sm font-semibold text-ink-800">{entry.status}</p>
                  {entry.note && <p className="text-xs text-ink-500">{entry.note}</p>}
                  <p className="text-[11px] text-ink-400">{formatDateTime(entry.changedAt)}</p>
                </li>
              ))}
              {data.statusHistory.length === 0 && <li className="muted">No history recorded yet.</li>}
            </ol>
          </div>

          {data.status === 'COMPLETED' && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink-900">Something went wrong?</h2>
              <p className="muted mt-1">Raise a complaint and an administrator will review it.</p>
              <Link to="/support" className="btn-secondary btn-sm mt-3">
                Contact support
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
