import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi } from '../api'
import { BookingCard } from '../components/BookingCard'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, SkeletonCards } from '../components/States'
import { useAsync } from '../hooks/useAsync'
import { cn } from '../utils/format'
import type { BookingStatus } from '../types'

const FILTERS: { label: string; value?: BookingStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function MyBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined)
  const [page, setPage] = useState(0)

  const bookings = useAsync(() => bookingApi.mine({ status, page, size: 6 }), [status, page])

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">My bookings</h1>
      <p className="muted mt-1">Track every booking and open one to see its full status history.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatus(filter.value)
              setPage(0)
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              status === filter.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {bookings.loading && <SkeletonCards count={3} />}
        {bookings.error && <ErrorState error={bookings.error} onRetry={bookings.reload} />}
        {bookings.data && bookings.data.content.length === 0 && (
          <EmptyState
            title={status ? 'No bookings with this status' : 'No bookings yet'}
            description="Browse a service, choose a package and confirm your first booking."
            action={
              <Link to="/search" className="btn-primary btn-sm">
                Find a service
              </Link>
            }
          />
        )}
        {bookings.data?.content.map((booking) => (
          <BookingCard key={booking.id} booking={booking} perspective="customer" />
        ))}
      </div>

      {bookings.data && bookings.data.content.length > 0 && (
        <div className="mt-6">
          <Pagination
            page={bookings.data.page}
            totalPages={bookings.data.totalPages}
            totalElements={bookings.data.totalElements}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
