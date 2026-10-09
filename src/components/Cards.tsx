import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, MapPin, Star } from 'lucide-react'
import { CategoryIcon } from './CategoryIcon'
import { RatingStars } from './RatingStars'
import { SmartImage } from './SmartImage'
import { ProviderStatusBadge } from './StatusBadge'
import { cn, duration, initials, inr, pricingLabel } from '../utils/format'
import type { CategoryResponse, ProviderResponse, ServicePackageResponse, ServiceResponse } from '../types'

export function CategoryCard({ category }: { category: CategoryResponse }) {
  return (
    <Link
      to={`/category/${category.id}`}
      className="card group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
    >
      <SmartImage
        src={category.imageUrl}
        alt={category.name}
        seed={category.slug}
        className="h-20 w-20 rounded-xl"
      >
        <CategoryIcon name={category.iconName} className="h-9 w-9 text-white" />
      </SmartImage>
      <div>
        <p className="text-sm font-semibold text-ink-900 group-hover:text-brand-700">{category.name}</p>
        <p className="muted">
          {category.serviceCount} service{category.serviceCount === 1 ? '' : 's'}
        </p>
      </div>
    </Link>
  )
}

export function ServiceCard({ service, compact = false }: { service: ServiceResponse; compact?: boolean }) {
  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/services/${service.id}`} className="block">
        <SmartImage
          src={service.imageUrl}
          alt={service.name}
          seed={service.slug}
          className={cn('w-full', compact ? 'h-32' : 'h-40')}
        >
          <CategoryIcon name={service.categorySlug} className="h-10 w-10 text-white" />
        </SmartImage>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            {service.categoryName}
          </span>
          {service.featured && <span className="chip bg-amber-50 text-amber-700 ring-amber-200">Popular</span>}
        </div>

        <Link to={`/services/${service.id}`} className="text-base font-semibold text-ink-900 hover:text-brand-700">
          {service.name}
        </Link>

        {service.shortDescription && <p className="line-clamp-2 text-sm text-ink-500">{service.shortDescription}</p>}

        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration(service.durationMinutes)}
          </span>
          <RatingStars average={service.ratingAverage} count={service.ratingCount} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
              {pricingLabel(service.pricingType)}
            </p>
            <p className="text-lg font-bold text-ink-900">{inr(service.basePrice)}</p>
          </div>
          <Link to={`/services/${service.id}`} className="btn-primary btn-sm">
            Book now
          </Link>
        </div>
      </div>
    </article>
  )
}

export function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: ServicePackageResponse
  selected?: boolean
  onSelect?: (pkg: ServicePackageResponse) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(pkg)}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition',
        selected
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
          : 'border-ink-200 bg-white hover:border-brand-300',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-900">{pkg.name}</p>
          <p className="text-xs text-ink-500">{duration(pkg.durationMinutes)}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-ink-900">{inr(pkg.price)}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">
            {pricingLabel(pkg.pricingType)}
          </p>
        </div>
      </div>

      {pkg.description && <p className="mt-2 text-sm text-ink-600">{pkg.description}</p>}

      <div className="mt-3 grid gap-1 text-xs text-ink-500">
        {pkg.includedWork && (
          <p>
            <span className="font-semibold text-brand-700">Included:</span> {pkg.includedWork}
          </p>
        )}
        {pkg.excludedWork && (
          <p>
            <span className="font-semibold text-ink-600">Not included:</span> {pkg.excludedWork}
          </p>
        )}
      </div>
    </button>
  )
}

export function ProviderCard({ provider }: { provider: ProviderResponse }) {
  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <SmartImage
            src={provider.profileImageUrl}
            alt={provider.businessName}
            seed={`provider-${provider.id}`}
            className="h-12 w-12 rounded-full"
          >
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              {initials(provider.businessName)}
            </span>
          </SmartImage>
          <div>
            <Link to={`/providers/${provider.id}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">
              {provider.businessName}
            </Link>
            <p className="muted inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {provider.area ? `${provider.area}, ` : ''}
              {provider.city ?? 'Location not set'}
            </p>
          </div>
        </div>
        <ProviderStatusBadge status={provider.status} />
      </div>

      {provider.bio && <p className="line-clamp-2 text-sm text-ink-600">{provider.bio}</p>}

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
        {provider.ratingCount > 0 ? (
          <RatingStars average={provider.ratingAverage} count={provider.ratingCount} />
        ) : (
          <span>No reviews yet</span>
        )}
        {provider.experienceYears ? (
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5" />
            {provider.experienceYears} yrs experience
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          {provider.serviceCount} service{provider.serviceCount === 1 ? '' : 's'}
        </span>
      </div>

      <Link to={`/providers/${provider.id}`} className="btn-secondary btn-sm self-start">
        View profile
      </Link>
    </article>
  )
}
