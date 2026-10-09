import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { catalogApi } from '../api'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { RatingStars } from '../components/RatingStars'
import { ReviewList } from '../components/ReviewList'
import { useAsync } from '../hooks/useAsync'
import { inr } from '../utils/format'

/**
 * Reviews are not invented: this page lists reviews for the services that
 * actually have them, straight from MySQL.
 */
export default function ReviewsPage() {
  const popular = useAsync(() => catalogApi.popular(12), [])
  const bookableWithReviews = (popular.data ?? []).filter((service) => service.ratingCount > 0)
  const target = bookableWithReviews[0]

  const reviews = useAsync(
    () => (target ? catalogApi.serviceReviews(target.id, 0, 10) : Promise.resolve(null)),
    [target?.id],
  )

  return (
    <div className="container-page py-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
        <Star className="h-6 w-6 text-amber-500" />
        Customer reviews
      </h1>
      <p className="muted mt-1">
        Only customers with a completed booking can review a service, and only once per booking. Averages below are
        computed from real review rows.
      </p>

      {popular.loading && <Loader label="Loading the catalogue…" />}
      {popular.error && <ErrorState error={popular.error} onRetry={popular.reload} />}

      {popular.data && bookableWithReviews.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No reviews yet"
            description="No service in the catalogue has been reviewed so far. Complete a booking and leave the first review."
            action={
              <Link to="/search" className="btn-primary btn-sm">
                Find a service
              </Link>
            }
          />
        </div>
      )}

      {bookableWithReviews.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <aside className="card h-fit p-4">
            <h2 className="text-sm font-semibold text-ink-900">Services with reviews</h2>
            <ul className="mt-3 space-y-2">
              {bookableWithReviews.map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.id}`}
                    className={`block rounded-xl border p-3 text-sm transition ${
                      service.id === target?.id ? 'border-brand-400 bg-brand-50' : 'border-ink-200 hover:border-brand-300'
                    }`}
                  >
                    <p className="font-semibold text-ink-900">{service.name}</p>
                    <p className="mt-1">
                      <RatingStars average={service.ratingAverage} count={service.ratingCount} />
                    </p>
                    <p className="muted mt-1">from {inr(service.basePrice)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <section>
            <h2 className="section-title">{target?.name}</h2>
            <p className="muted mt-1">Reviews for this service, newest first.</p>
            <div className="mt-4">
              {reviews.loading && <Loader />}
              {reviews.data && <ReviewList reviews={reviews.data.content} />}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
