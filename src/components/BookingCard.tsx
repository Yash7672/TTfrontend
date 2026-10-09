import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, UserRound } from 'lucide-react'
import { BookingStatusBadge } from './StatusBadge'
import { formatDate, formatTime, inr } from '../utils/format'
import type { BookingResponse } from '../types'

interface BookingCardProps {
  booking: BookingResponse
  perspective?: 'customer' | 'provider' | 'admin'
  detailPath?: string
  footer?: ReactNode
}

export function BookingCard({ booking, perspective = 'customer', detailPath, footer }: BookingCardProps) {
  const path = detailPath ?? `/bookings/${booking.id}`

  return (
    <article className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link to={path} className="text-base font-semibold text-ink-900 hover:text-brand-700">
              {booking.serviceName}
            </Link>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="muted mt-0.5">
            {booking.packageName} · Ref {booking.bookingRef}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Agreed price</p>
          <p className="text-lg font-bold text-ink-900">{inr(booking.agreedPrice)}</p>
          <p className="text-[11px] text-ink-400">Payment: {booking.paymentStatus}</p>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-ink-400" />
          {formatDate(booking.bookingDate)}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-400" />
          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <MapPin className="h-4 w-4 text-ink-400" />
          <span className="truncate">{booking.addressSummary}</span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <UserRound className="h-4 w-4 text-ink-400" />
          {perspective === 'customer'
            ? booking.providerName
              ? `Provider: ${booking.providerName}`
              : 'Waiting for a provider to be assigned'
            : `Customer: ${booking.customerName}`}
        </div>
      </dl>

      {booking.statusNote && <p className="mt-2 text-xs text-ink-500">Note: {booking.statusNote}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link to={path} className="btn-secondary btn-sm">
          View details
        </Link>
        {footer}
      </div>
    </article>
  )
}
