import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarCheck, IndianRupee, ListChecks, Star } from 'lucide-react'
import { bookingApi, providerApi } from '../../api'
import { BookingCard } from '../../components/BookingCard'
import { ProviderStatusBadge } from '../../components/StatusBadge'
import { ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'
import { inr } from '../../utils/format'

export default function ProviderDashboardPage() {
  const provider = useAsync(() => providerApi.me(), [])
  const earnings = useAsync(() => providerApi.earnings(), [])
  const bookings = useAsync(() => bookingApi.providerQueue({ page: 0, size: 4 }), [])

  if (provider.loading) return <Loader label="Loading your provider workspace…" />

  // No provider profile yet: guide the provider to create one instead of erroring.
  if (provider.error) {
    const status = provider.error.status
    if (status === 403 || status === 404) {
      return (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-ink-900">You do not have a provider profile yet</h2>
          <p className="muted mt-1">
            Create your provider profile to list services, publish availability and receive bookings. New profiles start
            as Pending until an administrator approves them.
          </p>
          <Link to="/provider/profile" className="btn-primary mt-4">
            Create provider profile
          </Link>
        </div>
      )
    }
    return <ErrorState error={provider.error} onRetry={provider.reload} />
  }

  const profile = provider.data!
  const summary = earnings.data ?? {}

  const cards = [
    { label: 'Pending requests', value: String(summary.pendingBookings ?? 0), icon: <CalendarCheck className="h-4 w-4" /> },
    { label: 'Completed jobs', value: String(summary.completedBookings ?? 0), icon: <ListChecks className="h-4 w-4" /> },
    { label: 'Earnings estimate', value: inr(Number(summary.completedValue ?? 0)), icon: <IndianRupee className="h-4 w-4" /> },
    {
      label: 'Rating',
      value: profile.ratingCount > 0 ? `${profile.ratingAverage.toFixed(1)} / 5` : 'No reviews yet',
      icon: <Star className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{profile.businessName}</h2>
            <p className="muted mt-1">
              {profile.area ? `${profile.area}, ` : ''}
              {profile.city ?? 'City not set'} · {profile.serviceCount} services offered
            </p>
          </div>
          <ProviderStatusBadge status={profile.status} />
        </div>

        {profile.status !== 'APPROVED' && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your profile is <strong>{profile.status.toLowerCase()}</strong>. It will not appear in customer search and
              you cannot accept new bookings until an administrator approves it.
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/provider/profile" className="btn-secondary btn-sm">
            Edit profile
          </Link>
          <Link to="/provider/services" className="btn-secondary btn-sm">
            Manage services
          </Link>
          <Link to="/provider/availability" className="btn-secondary btn-sm">
            Availability
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {card.icon}
              {card.label}
            </span>
            <p className="mt-2 text-2xl font-bold text-ink-900">{card.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="section-title">Latest booking requests</h2>
          <Link to="/provider/bookings" className="btn-secondary btn-sm">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {bookings.loading && <Loader />}
          {bookings.data && bookings.data.content.length === 0 && (
            <p className="muted">No bookings yet. Once customers book your services they appear here.</p>
          )}
          {bookings.data?.content.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              perspective="provider"
              detailPath={`/provider/bookings/${booking.id}`}
            />
          ))}
        </div>
      </section>

      <p className="text-xs text-ink-400">
        {String(summary.estimateDisclaimer ?? 'Earnings are an estimate from completed bookings in this database.')}
      </p>
    </div>
  )
}
