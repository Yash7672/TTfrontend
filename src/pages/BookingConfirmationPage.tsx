import { Link, useParams } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { bookingApi } from '../api'
import { BookingStatusBadge } from '../components/StatusBadge'
import { ErrorState, Loader } from '../components/States'
import { useAsync } from '../hooks/useAsync'
import { formatDate, formatTime, inr } from '../utils/format'

export default function BookingConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const id = Number(bookingId)
  const booking = useAsync(() => bookingApi.get(id), [id])

  if (booking.loading) {
    return (
      <div className="container-page py-12">
        <Loader label="Loading your booking…" />
      </div>
    )
  }

  if (booking.error || !booking.data) {
    return (
      <div className="container-page py-12">
        <ErrorState error={booking.error ?? { status: 404, error: 'Not found', message: 'Booking not found.' }} onRetry={booking.reload} />
      </div>
    )
  }

  const data = booking.data

  return (
    <div className="container-page py-12">
      <div className="card mx-auto max-w-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ink-100 bg-brand-50 px-6 py-5">
          <CheckCircle2 className="h-8 w-8 text-brand-600" />
          <div>
            <h1 className="text-lg font-bold text-ink-900">Booking confirmed</h1>
            <p className="text-sm text-ink-600">
              Reference <span className="font-semibold">{data.bookingRef}</span> — the provider now sees your request.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">{data.serviceName}</p>
              <p className="muted">{data.packageName}</p>
            </div>
            <BookingStatusBadge status={data.status} />
          </div>

          <dl className="grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
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
          </dl>

          <div className="rounded-xl bg-ink-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Agreed price</span>
              <span className="text-lg font-bold text-ink-900">{inr(data.agreedPrice)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Recorded by the server from the package price. No online payment was taken.
            </p>
          </div>

          {data.providerName ? (
            <p className="muted">Provider: {data.providerName}</p>
          ) : (
            <p className="muted">
              No provider is assigned yet. Fixora will assign an approved provider, or an administrator can assign one.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Link to={`/bookings/${data.id}`} className="btn-primary btn-sm">
              Track this booking
            </Link>
            <Link to="/bookings" className="btn-secondary btn-sm">
              All my bookings
            </Link>
            <Link to="/search" className="btn-ghost btn-sm">
              Book another service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
