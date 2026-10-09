import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, UserRound } from 'lucide-react'
import { bookingApi } from '../../api'
import { errorMessage } from '../../api/client'
import { BookingStatusBadge } from '../../components/StatusBadge'
import { ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { formatDate, formatDateTime, formatTime, inr } from '../../utils/format'

export default function ProviderBookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const id = Number(bookingId)
  const toast = useToast()
  const booking = useAsync(() => bookingApi.get(id), [id])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: 'accept' | 'reject' | 'start' | 'complete') {
    setBusy(true)
    setError(null)
    try {
      if (action === 'accept') await bookingApi.accept(id)
      if (action === 'reject') await bookingApi.reject(id, 'Not available at that time.')
      if (action === 'start') await bookingApi.start(id)
      if (action === 'complete') await bookingApi.complete(id)
      toast.success(`Booking ${action}ed.`)
      booking.reload()
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  if (booking.loading) return <Loader label="Loading booking…" />

  if (booking.error || !booking.data) {
    return (
      <ErrorState
        error={booking.error ?? { status: 404, error: 'Not found', message: 'This booking is not assigned to you.' }}
        onRetry={booking.reload}
      />
    )
  }

  const data = booking.data

  return (
    <div className="space-y-6">
      <Link to="/provider/bookings" className="muted hover:text-brand-700">
        ← Back to booking requests
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{data.serviceName}</h2>
            <p className="muted mt-1">
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
            Customer: {data.customerName}
          </div>
        </dl>

        {data.customerNotes && (
          <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">
            <span className="font-medium text-ink-700">Customer notes: </span>
            {data.customerNotes}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
          <div className="mr-auto">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Agreed price</p>
            <p className="text-xl font-bold text-ink-900">{inr(data.agreedPrice)}</p>
          </div>

          {data.status === 'PENDING' && (
            <>
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void run('accept')}>
                Accept
              </button>
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => void run('reject')}>
                Reject
              </button>
            </>
          )}
          {data.status === 'ACCEPTED' && (
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void run('start')}>
              Start service
            </button>
          )}
          {data.status === 'IN_PROGRESS' && (
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void run('complete')}>
              Mark completed
            </button>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink-900">Status history</h3>
        <ol className="mt-3 space-y-3">
          {data.statusHistory.map((entry, index) => (
            <li key={`${entry.status}-${index}`} className="relative border-l border-ink-200 pl-4">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
              <p className="text-sm font-semibold text-ink-800">{entry.status}</p>
              {entry.note && <p className="text-xs text-ink-500">{entry.note}</p>}
              <p className="text-[11px] text-ink-400">{formatDateTime(entry.changedAt)}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
