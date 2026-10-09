import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, Clock, MapPin } from 'lucide-react'
import { providerApi } from '../api'
import { RatingStars } from '../components/RatingStars'
import { ReviewList } from '../components/ReviewList'
import { SmartImage } from '../components/SmartImage'
import { ProviderStatusBadge } from '../components/StatusBadge'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useAsync } from '../hooks/useAsync'
import { initials, inr } from '../utils/format'

export default function ProviderProfilePage() {
  const { providerId } = useParams<{ providerId: string }>()
  const id = Number(providerId)

  const provider = useAsync(() => providerApi.get(id), [id])
  const services = useAsync(() => providerApi.services(id), [id])
  const availability = useAsync(() => providerApi.availability(id), [id])
  const reviews = useAsync(() => providerApi.reviews(id, 0, 10), [id])

  if (provider.error) {
    return (
      <div className="container-page py-10">
        <ErrorState error={provider.error} onRetry={provider.reload} />
      </div>
    )
  }

  if (provider.loading || !provider.data) {
    return (
      <div className="container-page py-10">
        <Loader label="Loading provider…" />
      </div>
    )
  }

  const data = provider.data

  return (
    <div className="container-page py-8">
      <Link to="/search" className="muted hover:text-brand-700">
        ← Back to services
      </Link>

      <header className="card mt-4 flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <SmartImage
          src={data.profileImageUrl}
          alt={data.businessName}
          seed={`provider-${data.id}`}
          className="h-20 w-20 shrink-0 rounded-2xl"
        >
          <span className="text-2xl font-bold uppercase tracking-wide text-white">
            {initials(data.businessName)}
          </span>
        </SmartImage>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{data.businessName}</h1>
            <ProviderStatusBadge status={data.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {data.area ? `${data.area}, ` : ''}
              {data.city ?? 'Location not set'}
            </span>
            {data.experienceYears ? (
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 text-brand-600" />
                {data.experienceYears} years experience
              </span>
            ) : null}
            <RatingStars average={data.ratingAverage} count={data.ratingCount} />
          </div>

          {data.bio && <p className="mt-3 text-sm text-ink-600">{data.bio}</p>}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <h2 className="section-title">Services offered</h2>
          <div className="mt-4 grid gap-4">
            {services.loading && <Loader />}
            {services.data && services.data.length === 0 && (
              <EmptyState title="No services listed yet" description="This provider has not published an offering list." />
            )}
            {services.data && services.data.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {services.data.map((offering) => (
                  <li key={offering.id} className="card p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                      {offering.categoryName}
                    </p>
                    <Link to={`/services/${offering.serviceId}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">
                      {offering.serviceName}
                    </Link>
                    <p className="muted mt-1">
                      {offering.customPrice
                        ? `Provider price ${inr(offering.customPrice)}`
                        : `Catalogue price from ${inr(offering.cataloguePrice)}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2 className="section-title mt-10">Reviews</h2>
          <div className="mt-4">
            {reviews.loading && <Loader />}
            {reviews.data && <ReviewList reviews={reviews.data.content} />}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Clock className="h-4 w-4" />
              Weekly availability
            </h2>
            {availability.loading && <Loader />}
            {availability.data && availability.data.length === 0 && (
              <p className="muted mt-2">This provider has not published availability windows yet.</p>
            )}
            {availability.data && availability.data.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-600">
                {availability.data.map((window) => (
                  <li key={`${window.dayOfWeek}-${window.startTime}-${window.endTime}`} className="flex justify-between">
                    <span className="font-medium text-ink-800">{window.dayOfWeek}</span>
                    <span>
                      {String(window.startTime).slice(0, 5)} – {String(window.endTime).slice(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">How booking works here</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink-600">
              <li>1. Pick one of this provider's services.</li>
              <li>2. Choose a package and a time inside their working hours.</li>
              <li>3. Confirm the booking — the provider accepts or rejects it.</li>
            </ul>
            <p className="mt-3 text-xs text-ink-500">
              Each package lists its own estimated duration on the service page.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
