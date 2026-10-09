import { providerApi } from '../../api'
import { RatingStars } from '../../components/RatingStars'
import { ReviewList } from '../../components/ReviewList'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'

export default function ProviderReviewsPage() {
  const profile = useAsync(() => providerApi.me(), [])
  const reviews = useAsync(
    () => (profile.data ? providerApi.reviews(profile.data.id, 0, 20) : Promise.resolve(null)),
    [profile.data?.id],
  )

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">Ratings and reviews</h2>
        <p className="muted mt-1">
          Only customers with a completed booking can review you, one review per booking. Hidden reviews are excluded
          from your average by the moderation rule.
        </p>

        {profile.data && (
          <div className="mt-4">
            <RatingStars average={profile.data.ratingAverage} count={profile.data.ratingCount} size="md" />
          </div>
        )}
      </div>

      {reviews.loading && <Loader label="Loading reviews…" />}
      {reviews.error && <ErrorState error={reviews.error} onRetry={reviews.reload} />}
      {reviews.data && reviews.data.content.length === 0 && (
        <EmptyState
          title="No reviews yet"
          description="Complete a booking and your customer can leave the first review."
        />
      )}
      {reviews.data && reviews.data.content.length > 0 && <ReviewList reviews={reviews.data.content} />}
    </div>
  )
}
