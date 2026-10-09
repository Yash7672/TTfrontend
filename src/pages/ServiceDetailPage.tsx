import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Bot, Clock, Info, Send, ShieldCheck } from 'lucide-react'
import { aiApi, catalogApi, providerApi } from '../api'
import { errorMessage } from '../api/client'
import { PackageCard, ProviderCard } from '../components/Cards'
import { CategoryIcon } from '../components/CategoryIcon'
import { RatingStars } from '../components/RatingStars'
import { ReviewList } from '../components/ReviewList'
import { SmartImage } from '../components/SmartImage'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useCity } from '../context/CityContext'
import { useAsync } from '../hooks/useAsync'
import { duration, inr, pricingLabel, pricingNote } from '../utils/format'
import type { ServicePackageResponse } from '../types'

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const id = Number(serviceId)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { city } = useCity()

  const service = useAsync(() => catalogApi.service(id), [id])
  const packages = useAsync(() => catalogApi.packages(id), [id])
  const providers = useAsync(() => providerApi.search({ serviceId: id, city, size: 6 }), [id, city])
  const reviews = useAsync(() => catalogApi.serviceReviews(id, 0, 5), [id])
  const rating = useAsync(() => catalogApi.serviceRating(id), [id])

  const [selected, setSelected] = useState<ServicePackageResponse | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    if (packages.data && packages.data.length > 0 && !selected) {
      setSelected(packages.data[0])
    }
  }, [packages.data, selected])

  async function askAssistant(event: React.FormEvent) {
    event.preventDefault()
    if (!question.trim()) return
    setAsking(true)
    try {
      const reply = await aiApi.bookingAssistance({ message: question.trim(), serviceId: id })
      setAnswer(reply.reply)
    } catch (error) {
      setAnswer(`The assistant could not answer: ${errorMessage(error)}`)
    } finally {
      setAsking(false)
    }
  }

  function startBooking() {
    if (!selected) return
    navigate(`/services/${id}/checkout?packageId=${selected.id}`)
  }

  if (service.error) {
    return (
      <div className="container-page py-10">
        <ErrorState error={service.error} onRetry={service.reload} />
      </div>
    )
  }

  if (service.loading || !service.data) {
    return (
      <div className="container-page py-10">
        <Loader label="Loading service…" />
      </div>
    )
  }

  const serviceData = service.data

  return (
    <div className="container-page py-8">
      <nav className="muted" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand-700">
          Home
        </Link>{' '}
        /{' '}
        <Link to={`/category/${serviceData.categoryId}`} className="hover:text-brand-700">
          {serviceData.categoryName}
        </Link>{' '}
        / <span className="text-ink-700">{serviceData.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <SmartImage
            src={serviceData.imageUrl}
            alt={serviceData.name}
            seed={serviceData.slug}
            className="h-56 w-full rounded-2xl sm:h-72"
          >
            <CategoryIcon name={serviceData.categorySlug} className="h-16 w-16 text-white" />
          </SmartImage>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">{serviceData.name}</h1>
              {serviceData.featured && <span className="chip bg-amber-50 text-amber-700 ring-amber-200">Popular</span>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
              <RatingStars average={serviceData.ratingAverage} count={serviceData.ratingCount} size="md" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration(serviceData.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                &nbsp;Fixora catalogue
              </span>
            </div>
            {serviceData.description && <p className="mt-4 text-sm text-ink-600">{serviceData.description}</p>}
          </div>

          {/* ----------------------------------------------------- packages */}
          <section>
            <h2 className="section-title">Choose a package</h2>
            <p className="muted mt-1">
              Prices below are exactly what the server records on your booking. The browser never decides the price.
            </p>

            {packages.loading && <Loader />}
            {packages.error && <ErrorState error={packages.error} onRetry={packages.reload} />}
            {packages.data && packages.data.length === 0 && (
              <EmptyState title="No packages yet" description="An administrator has not published packages for this service." />
            )}
            {packages.data && packages.data.length > 0 && (
              <div className="mt-4 grid gap-3">
                {packages.data.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} selected={selected?.id === pkg.id} onSelect={setSelected} />
                ))}
              </div>
            )}
          </section>

          {/* --------------------------------------------- ask the assistant */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Bot className="h-4 w-4 text-brand-600" />
              Not sure which package? Ask the Fixora AI Assistant
            </h2>
            <p className="muted mt-1">
              It answers using this service's real packages from the database — it cannot invent prices.
            </p>
            <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={askAssistant}>
              <input
                className="input"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="e.g. I only need a basic check"
                aria-label="Ask about this service"
              />
              <button type="submit" className="btn-secondary" disabled={asking}>
                <Send className="h-4 w-4" />
                {asking ? 'Asking…' : 'Ask'}
              </button>
            </form>
            {answer && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm text-ink-700">{answer}</p>
            )}
          </section>

          {/* ------------------------------------------------------ reviews */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="section-title">Reviews</h2>
              {rating.data && (
                <RatingStars average={rating.data.averageRating} count={rating.data.reviewCount} size="md" />
              )}
            </div>
            <div className="mt-4">
              {reviews.loading && <Loader />}
              {reviews.data && <ReviewList reviews={reviews.data.content} />}
            </div>
          </section>
        </div>

        {/* --------------------------------------------------------- sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              {selected ? pricingLabel(selected.pricingType) : pricingLabel(serviceData.pricingType)}
            </p>
            <p className="text-3xl font-extrabold text-ink-900">{inr(selected?.price ?? serviceData.basePrice)}</p>
            <p className="muted mt-1">
              {selected ? `${selected.name} · ${duration(selected.durationMinutes)}` : 'Select a package below'}
            </p>

            <div className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
              <p className="flex items-start gap-1.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span>{pricingNote(selected?.pricingType ?? serviceData.pricingType)}</span>
              </p>
            </div>

            <button type="button" className="btn-primary mt-4 w-full" onClick={startBooking} disabled={!selected}>
              Book this package
            </button>

            {!user && (
              <p className="muted mt-2 text-center">
                You will be asked to sign in before confirming the booking.
              </p>
            )}
            <p className="mt-2 text-center text-[11px] text-ink-400">
              Demo prices for this project — not official prices from any real company.
            </p>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Providers for this service in {city}</h2>
            <p className="muted mt-1">Only approved providers are listed. Search is a real database query.</p>
            <div className="mt-3 space-y-3">
              {providers.loading && <Loader label="Searching providers…" />}
              {providers.data && providers.data.content.length === 0 && (
                <p className="muted">
                  No approved provider covers this service in {city} yet. You can still book and Fixora will assign a
                  provider.
                </p>
              )}
              {providers.data?.content.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Book with confidence</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Server-validated price, date, time and provider availability
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Overlapping bookings for the same provider are rejected
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                Full status history from Pending to Completed
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
