import { useState } from 'react'
import { bookingApi } from '../../api'
import { errorMessage } from '../../api/client'
import { BookingCard } from '../../components/BookingCard'
import { Pagination } from '../../components/Pagination'
import { EmptyState, ErrorState, SkeletonCards } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { cn } from '../../utils/format'
import type { BookingStatus } from '../../types'

const FILTERS: { label: string; value?: BookingStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function ProviderBookingsPage() {
  const toast = useToast()
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)

  const bookings = useAsync(() => bookingApi.providerQueue({ status, page, size: 6 }), [status, page])

  async function run(bookingId: number, action: 'accept' | 'reject' | 'start' | 'complete') {
    setBusyId(bookingId)
    try {
      if (action === 'accept') await bookingApi.accept(bookingId)
      if (action === 'reject') await bookingApi.reject(bookingId, 'Not available at that time.')
      if (action === 'start') await bookingApi.start(bookingId)
      if (action === 'complete') await bookingApi.complete(bookingId)
      toast.success(`Booking ${action}ed.`)
      bookings.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Booking requests</h2>
        <p className="muted mt-1">
          Only the provider assigned to a booking can accept, reject, start or complete it — the backend enforces this.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <div className="space-y-4">
        {bookings.loading && <SkeletonCards count={3} />}
        {bookings.error && <ErrorState error={bookings.error} onRetry={bookings.reload} />}
        {bookings.data && bookings.data.content.length === 0 && (
          <EmptyState
            title={status ? 'Nothing with this status' : 'No bookings yet'}
            description="When a customer books one of your services the request lands here."
          />
        )}

        {bookings.data?.content.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            perspective="provider"
            detailPath={`/provider/bookings/${booking.id}`}
            footer={
              <>
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      disabled={busyId === booking.id}
                      onClick={() => void run(booking.id, 'accept')}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      disabled={busyId === booking.id}
                      onClick={() => void run(booking.id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
                {booking.status === 'ACCEPTED' && (
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    disabled={busyId === booking.id}
                    onClick={() => void run(booking.id, 'start')}
                  >
                    Start service
                  </button>
                )}
                {booking.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    disabled={busyId === booking.id}
                    onClick={() => void run(booking.id, 'complete')}
                  >
                    Mark completed
                  </button>
                )}
              </>
            }
          />
        ))}
      </div>

      {bookings.data && bookings.data.content.length > 0 && (
        <Pagination
          page={bookings.data.page}
          totalPages={bookings.data.totalPages}
          totalElements={bookings.data.totalElements}
          onChange={setPage}
        />
      )}
    </div>
  )
}
