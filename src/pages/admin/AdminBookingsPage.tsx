import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { BookingStatusBadge } from '../../components/StatusBadge'
import { Pagination } from '../../components/Pagination'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { cn, formatDate, formatTime, inr } from '../../utils/format'
import type { BookingStatus } from '../../types'

const FILTERS: { label: string; value?: BookingStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
]

export default function AdminBookingsPage() {
  const toast = useToast()
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [assignFor, setAssignFor] = useState<number | null>(null)
  const [providerId, setProviderId] = useState('')

  const bookings = useAsync(() => adminApi.bookings({ status, page, size: 20 }), [status, page])
  const approvedProviders = useAsync(() => adminApi.providers({ status: 'APPROVED', size: 60 }), [])

  async function assign(bookingId: number) {
    if (!providerId) return
    try {
      await adminApi.assignProvider(bookingId, Number(providerId))
      toast.success('Provider assigned.')
      setAssignFor(null)
      setProviderId('')
      bookings.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Booking management</h2>
        <p className="muted mt-1">
          Assign an approved provider to a pending booking. The backend re-checks approval, offering and overlapping
          bookings before assigning.
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

      {bookings.loading && <Loader />}
      {bookings.error && <ErrorState error={bookings.error} onRetry={bookings.reload} />}
      {bookings.data && bookings.data.content.length === 0 && <EmptyState title="No bookings in this view" />}

      {bookings.data && bookings.data.content.length > 0 && (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {bookings.data.content.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 font-mono text-xs text-ink-700">{booking.bookingRef}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{booking.serviceName}</p>
                      <p className="text-xs text-ink-500">{booking.packageName}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{booking.customerName}</td>
                    <td className="px-4 py-3 text-ink-600">{booking.providerName ?? '— unassigned —'}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {formatDate(booking.bookingDate)}
                      <span className="block text-xs text-ink-500">{formatTime(booking.startTime)}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-900">{inr(booking.agreedPrice)}</td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'PENDING' ? (
                        assignFor === booking.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="input py-1.5 text-xs"
                              value={providerId}
                              onChange={(event) => setProviderId(event.target.value)}
                            >
                              <option value="">Choose provider</option>
                              {(approvedProviders.data?.content ?? []).map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.businessName}
                                </option>
                              ))}
                            </select>
                            <button type="button" className="btn-primary btn-sm" onClick={() => void assign(booking.id)}>
                              Assign
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => {
                              setAssignFor(booking.id)
                              setProviderId('')
                            }}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Assign
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={bookings.data.page}
            totalPages={bookings.data.totalPages}
            totalElements={bookings.data.totalElements}
            onChange={setPage}
          />
        </>
      )}

      <p className="text-xs text-ink-400">
        Customers and providers manage their own bookings from{' '}
        <Link to="/bookings" className="text-brand-700">
          My bookings
        </Link>{' '}
        and the provider workspace.
      </p>
    </div>
  )
}
