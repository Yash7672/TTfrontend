import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { RatingStars } from '../../components/RatingStars'
import { Pagination } from '../../components/Pagination'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { formatDateTime } from '../../utils/format'
import type { ReviewResponse } from '../../types'

export default function AdminReviewsPage() {
  const toast = useToast()
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)
  const reviews = useAsync(() => adminApi.reviews(page, 20), [page])

  async function toggleVisibility(review: ReviewResponse) {
    setBusyId(review.id)
    try {
      await adminApi.setReviewVisibility(review.id, !review.visible)
      toast.success(`Review ${review.visible ? 'hidden' : 'restored'}. Ratings were recalculated from visible reviews.`)
      reviews.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Review moderation</h2>
        <p className="muted mt-1">
          Hiding a review keeps the row in the database but removes it from public listings and from the service and
          provider averages, which are recalculated immediately.
        </p>
      </div>

      {reviews.loading && <Loader />}
      {reviews.error && <ErrorState error={reviews.error} onRetry={reviews.reload} />}
      {reviews.data && reviews.data.content.length === 0 && (
        <EmptyState title="No reviews yet" description="Reviews appear here once customers complete bookings." />
      )}

      <div className="space-y-4">
        {reviews.data?.content.map((review) => (
          <article key={review.id} className={`card p-5 ${review.visible ? '' : 'opacity-70'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {review.serviceName} · {review.providerName ?? 'no provider'}
                </p>
                <p className="muted mt-1">
                  {review.customerName} · booking #{review.bookingId} · {formatDateTime(review.createdAt)}
                </p>
                <div className="mt-2">
                  <RatingStars average={review.rating} count={1} showCount={false} />
                </div>
              </div>
              <span className={`chip ${review.visible ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-rose-50 text-rose-700 ring-rose-200'}`}>
                {review.visible ? 'Visible' : 'Hidden'}
              </span>
            </div>

            {review.comment && <p className="mt-2 text-sm text-ink-600">{review.comment}</p>}

            <button
              type="button"
              className="btn-secondary btn-sm mt-3"
              disabled={busyId === review.id}
              onClick={() => void toggleVisibility(review)}
            >
              {review.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {review.visible ? 'Hide review' : 'Restore review'}
            </button>
          </article>
        ))}
      </div>

      {reviews.data && reviews.data.content.length > 0 && (
        <Pagination
          page={reviews.data.page}
          totalPages={reviews.data.totalPages}
          totalElements={reviews.data.totalElements}
          onChange={setPage}
        />
      )}
    </div>
  )
}
