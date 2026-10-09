import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  ChevronRight,
  History,
  IndianRupee,
  ListChecks,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { aiApi, catalogApi } from '../api'
import { CategoryCard, ServiceCard } from '../components/Cards'
import { ReviewList } from '../components/ReviewList'
import { EmptyState, ErrorState, Loader, SkeletonCards } from '../components/States'
import { SearchBar } from '../components/SearchBar'
import { useCity } from '../context/CityContext'
import { useAsync } from '../hooks/useAsync'
import { FAQS, HOW_IT_WORKS, WHY_FIXORA } from '../utils/constants'
import { inr } from '../utils/format'
import type { ReactNode } from 'react'

const WHY_ICONS: Record<string, ReactNode> = {
  'calendar-check': <CalendarCheck className="h-5 w-5" />,
  'list-check': <ListChecks className="h-5 w-5" />,
  'shield-check': <ShieldCheck className="h-5 w-5" />,
  'indian-rupee': <IndianRupee className="h-5 w-5" />,
  history: <History className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
}

export default function HomePage() {
  const { city } = useCity()

  const categories = useAsync(() => catalogApi.categories(), [])
  const popular = useAsync(() => catalogApi.popular(8), [])
  const recommendations = useAsync(
    () => aiApi.recommendations({ query: '', city, limit: 3 }),
    [city],
  )

  // Real reviews: read them from the most booked service in the catalogue.
  const topServiceId = popular.data?.[0]?.id
  const reviews = useAsync(
    () => (topServiceId ? catalogApi.serviceReviews(topServiceId, 0, 3) : Promise.resolve(null)),
    [topServiceId],
  )

  const heroStats = useMemo(() => {
    const serviceCount = (categories.data ?? []).reduce((total, category) => total + category.serviceCount, 0)
    return [
      { label: 'Service categories', value: categories.data?.length ?? 0 },
      { label: 'Bookable services', value: serviceCount },
      { label: 'Starting price', value: popular.data?.length ? inr(Math.min(...popular.data.map((s) => s.basePrice))) : '—' },
    ]
  }, [categories.data, popular.data])

  return (
    <div className="pb-4">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="chip bg-white/10 text-white ring-white/20">
              <MapPin className="h-3 w-3" />
              Serving {city}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Your home, taken care of.
            </h1>
            <p className="mt-3 max-w-xl text-base text-brand-50">
              Book trusted professionals for cleaning, repairs, maintenance and more — with clear package pricing and
              real booking status tracking.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-2 shadow-lg">
              <SearchBar size="lg" />
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-brand-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Popular right now in {city}
              </p>
              <ul className="mt-4 space-y-3">
                {(popular.data ?? []).slice(0, 4).map((service) => (
                  <li key={service.id}>
                    <Link
                      to={`/services/${service.id}`}
                      className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      <span className="truncate">{service.name}</span>
                      <span className="ml-3 shrink-0 font-semibold">{inr(service.basePrice)}</span>
                    </Link>
                  </li>
                ))}
                {!popular.data && <li className="text-sm text-brand-100">Loading the catalogue…</li>}
              </ul>
              <Link to="/search" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Browse everything
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Popular categories</h2>
            <p className="muted mt-1">Loaded from the Fixora catalogue in MySQL.</p>
          </div>
          <Link to="/search" className="btn-secondary btn-sm hidden sm:inline-flex">
            All services
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {categories.loading && <SkeletonCards count={6} />}
        {categories.error && <ErrorState error={categories.error} onRetry={categories.reload} />}
        {categories.data && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.data.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------- popular services */}
      <section className="container-page py-6">
        <div className="mb-6">
          <h2 className="section-title">Popular services</h2>
          <p className="muted mt-1">Ranked by how often they are booked on Fixora.</p>
        </div>

        {popular.loading && <SkeletonCards count={3} />}
        {popular.error && <ErrorState error={popular.error} onRetry={popular.reload} />}
        {popular.data && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.data.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- recommendations */}
      <section className="container-page py-10">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 bg-ink-50 px-6 py-4">
            <h2 className="text-lg font-bold text-ink-900">Recommended for you</h2>
            <p className="muted mt-1">
              {recommendations.data?.mode === 'rules'
                ? 'Selected by a transparent rule-based score over the live catalogue (match, real review scores, popularity, budget). No service is invented.'
                : 'Smart recommendations from the Fixora catalogue.'}
            </p>
          </div>

          <div className="p-6">
            {recommendations.loading && <Loader label="Scoring the catalogue…" />}
            {recommendations.error && <ErrorState error={recommendations.error} onRetry={recommendations.reload} />}
            {recommendations.data && recommendations.data.recommendations.length === 0 && (
              <EmptyState title="No recommendations yet" description="Add services to the catalogue to see them here." />
            )}
            {recommendations.data && recommendations.data.recommendations.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-3">
                {recommendations.data.recommendations.map((item) => (
                  <li key={item.service.id} className="rounded-2xl border border-ink-200 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                      Score {item.score}
                    </p>
                    <Link
                      to={`/services/${item.service.id}`}
                      className="mt-1 block text-sm font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {item.service.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-500">{item.reason}</p>
                    <p className="mt-2 text-sm font-bold text-ink-900">from {inr(item.service.basePrice)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- why fixora */}
      <section className="border-y border-ink-200 bg-white py-12">
        <div className="container-page">
          <h2 className="section-title">Why Fixora</h2>
          <p className="muted mt-1">
            Only claims this project can actually back up. Where something is not implemented, we say so.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_FIXORA.map((item) => (
              <div key={item.title} className="rounded-2xl border border-ink-200 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  {WHY_ICONS[item.icon] ?? <Sparkles className="h-5 w-5" />}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section className="container-page py-12">
        <h2 className="section-title">How it works</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- reviews */}
      <section className="border-y border-ink-200 bg-white py-12">
        <div className="container-page">
          <h2 className="section-title">Customer reviews</h2>
          <p className="muted mt-1">
            {popular.data?.[0]
              ? `Real reviews written for “${popular.data[0].name}”. Fixora only accepts reviews from completed bookings.`
              : 'Reviews written by customers after a completed booking.'}
          </p>

          <div className="mt-6">
            {reviews.loading && <Loader label="Loading reviews…" />}
            {reviews.data && <ReviewList reviews={reviews.data.content} emptyMessage="No reviews yet." />}
            {!reviews.loading && !reviews.data && (
              <p className="muted">Book and complete a service to leave the first review.</p>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- faq */}
      <section className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="section-title">Frequently asked questions</h2>
          <Link to="/faq" className="btn-secondary btn-sm">
            Full FAQ
          </Link>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {FAQS.slice(0, 4).map((faq) => (
            <details key={faq.question} className="card p-5">
              <summary className="cursor-pointer text-sm font-semibold text-ink-900">{faq.question}</summary>
              <p className="mt-2 text-sm text-ink-500">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ cta */}
      <section className="container-page pb-4">
        <div className="card flex flex-col items-start justify-between gap-4 bg-brand-600 p-8 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Are you a local professional?</h2>
            <p className="mt-1 text-sm text-brand-50">
              Register as a provider, list the services you offer and manage bookings from your own dashboard.
            </p>
          </div>
          <Link to="/become-provider" className="btn bg-white text-brand-700 hover:bg-brand-50">
            Become a provider
          </Link>
        </div>
      </section>
    </div>
  )
}
