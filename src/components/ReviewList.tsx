import { Star } from 'lucide-react'
import { formatDateTime, initials } from '../utils/format'
import type { ReviewResponse } from '../types'

export function ReviewList({
  reviews,
  emptyMessage = 'No reviews yet.',
}: {
  reviews: ReviewResponse[]
  emptyMessage?: string
}) {
  if (reviews.length === 0) {
    return <p className="muted">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
              {initials(review.customerName ?? 'Fixora customer')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">{review.customerName ?? 'Fixora customer'}</p>
                <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={
                        value <= review.rating ? 'h-3.5 w-3.5 fill-amber-400 text-amber-400' : 'h-3.5 w-3.5 text-ink-300'
                      }
                    />
                  ))}
                  <span className="ml-1">{formatDateTime(review.createdAt)}</span>
                </span>
              </div>
              {review.comment && <p className="mt-1.5 text-sm text-ink-600">{review.comment}</p>}
              {!review.visible && <p className="mt-1 text-xs font-medium text-rose-600">Hidden by moderation</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
