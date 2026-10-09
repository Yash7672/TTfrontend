import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Sparkles } from 'lucide-react'
import { aiApi, catalogApi } from '../api'
import { errorMessage } from '../api/client'
import { ServiceCard } from '../components/Cards'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, Loader, SkeletonCards } from '../components/States'
import { useCity } from '../context/CityContext'
import { useAsync } from '../hooks/useAsync'
import { inr } from '../utils/format'
import type { AiSearchResponse } from '../types'

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams()
  const { city } = useCity()
  const [page, setPage] = useState(0)

  const keyword = params.get('keyword') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const minPrice = params.get('minPrice') ?? ''
  const maxPrice = params.get('maxPrice') ?? ''
  const sort = params.get('sort') ?? 'rating'

  const [nlQuery, setNlQuery] = useState('')
  const [nlResult, setNlResult] = useState<AiSearchResponse | null>(null)
  const [nlBusy, setNlBusy] = useState(false)
  const [nlError, setNlError] = useState<string | null>(null)

  const categories = useAsync(() => catalogApi.categories(), [])
  const services = useAsync(
    () =>
      catalogApi.services({
        keyword: keyword || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
        page,
        size: 12,
      }),
    [keyword, categoryId, minPrice, maxPrice, sort, page],
  )

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setParams(next)
    setPage(0)
  }

  async function runNaturalLanguageSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!nlQuery.trim()) return
    setNlBusy(true)
    setNlError(null)
    try {
      setNlResult(await aiApi.search({ query: nlQuery.trim(), city }))
    } catch (error) {
      setNlError(errorMessage(error))
      setNlResult(null)
    } finally {
      setNlBusy(false)
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">
        {keyword ? `Results for “${keyword}”` : 'All services'}
      </h1>
      <p className="muted mt-1">
        Every result comes from a database query, filtered by your selections — no hardcoded lists.
      </p>

      {/* ------------------------------------------- natural language search */}
      <section className="card mt-6 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Describe what you need in plain English
        </h2>
        <p className="muted mt-1">
          For example “I need deep cleaning for my apartment under 2000” or “plumber for a leaking tap”.
        </p>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={runNaturalLanguageSearch}>
          <input
            className="input"
            value={nlQuery}
            onChange={(event) => setNlQuery(event.target.value)}
            placeholder="Describe the service you need…"
            aria-label="Natural language search"
          />
          <button type="submit" className="btn-primary" disabled={nlBusy}>
            {nlBusy ? 'Searching…' : 'Smart search'}
          </button>
        </form>

        {nlError && <p className="field-error mt-2">{nlError}</p>}
        {nlBusy && <Loader label="Reading the catalogue…" className="py-4" />}

        {nlResult && (
          <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-sm text-ink-800">{nlResult.message}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(nlResult.criteria)
                .filter(([, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
                .map(([key, value]) => (
                  <span key={key} className="chip bg-white text-ink-600 ring-ink-200">
                    {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                ))}
              <span className="chip bg-white text-ink-600 ring-ink-200">mode: {nlResult.mode}</span>
            </div>
            {nlResult.services.length === 0 ? (
              <p className="muted mt-3">No matching service in the catalogue for that wording.</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {nlResult.services.slice(0, 6).map((service) => (
                  <li key={service.id}>
                    <Link
                      to={`/services/${service.id}`}
                      className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm hover:border-brand-300"
                    >
                      <span className="truncate">{service.name}</span>
                      <span className="ml-2 shrink-0 font-semibold text-ink-800">from {inr(service.basePrice)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- filters */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="card h-fit p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Filter className="h-4 w-4" />
            Filters
          </h2>

          <label className="label mt-4" htmlFor="filter-category">
            Category
          </label>
          <select
            id="filter-category"
            className="input"
            value={categoryId}
            onChange={(event) => updateParam('categoryId', event.target.value)}
          >
            <option value="">All categories</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="label mt-4" htmlFor="filter-min">
            Min price (₹)
          </label>
          <input
            id="filter-min"
            type="number"
            min={0}
            className="input"
            value={minPrice}
            onChange={(event) => updateParam('minPrice', event.target.value)}
            placeholder="0"
          />

          <label className="label mt-4" htmlFor="filter-max">
            Max price (₹)
          </label>
          <input
            id="filter-max"
            type="number"
            min={0}
            className="input"
            value={maxPrice}
            onChange={(event) => updateParam('maxPrice', event.target.value)}
            placeholder="Any"
          />

          <label className="label mt-4" htmlFor="filter-sort">
            Sort by
          </label>
          <select id="filter-sort" className="input" value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
            <option value="newest">Newest</option>
          </select>

          <button
            type="button"
            className="btn-secondary btn-sm mt-5 w-full"
            onClick={() => {
              setParams(new URLSearchParams())
              setPage(0)
            }}
          >
            Clear filters
          </button>
        </aside>

        <div>
          {services.loading && <SkeletonCards count={6} />}
          {services.error && <ErrorState error={services.error} onRetry={services.reload} />}
          {services.data && services.data.content.length === 0 && (
            <EmptyState
              title="No services matched those filters"
              description="Try a broader keyword, a higher maximum price, or clear the filters to see the whole catalogue."
              action={
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => {
                    setParams(new URLSearchParams())
                    setPage(0)
                  }}
                >
                  Clear filters
                </button>
              }
            />
          )}
          {services.data && services.data.content.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {services.data.content.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  page={services.data.page}
                  totalPages={services.data.totalPages}
                  totalElements={services.data.totalElements}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
