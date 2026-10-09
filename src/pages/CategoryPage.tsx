import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { catalogApi } from '../api'
import { CategoryIcon } from '../components/CategoryIcon'
import { ServiceCard } from '../components/Cards'
import { Pagination } from '../components/Pagination'
import { EmptyState, ErrorState, SkeletonCards } from '../components/States'
import { useAsync } from '../hooks/useAsync'

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const id = Number(categoryId)
  const [page, setPage] = useState(0)

  const category = useAsync(() => catalogApi.category(id), [id])
  const services = useAsync(() => catalogApi.categoryServices(id, page, 12), [id, page])

  return (
    <div className="container-page py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-brand-700">
        <ChevronLeft className="h-4 w-4" />
        Back to home
      </Link>

      {category.error && (
        <div className="mt-4">
          <ErrorState error={category.error} onRetry={category.reload} />
        </div>
      )}

      {category.data && (
        <header className="mt-4 flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white">
            <CategoryIcon name={category.data.iconName} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{category.data.name}</h1>
            {category.data.description && <p className="muted mt-1">{category.data.description}</p>}
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-400">
              {category.data.serviceCount} service{category.data.serviceCount === 1 ? '' : 's'} available
            </p>
          </div>
        </header>
      )}

      <section className="mt-8">
        {services.loading && <SkeletonCards count={6} />}
        {services.error && <ErrorState error={services.error} onRetry={services.reload} />}
        {services.data && services.data.content.length === 0 && (
          <EmptyState
            title="No services in this category yet"
            description="An administrator can add services to this category from the admin panel."
            action={
              <Link to="/search" className="btn-primary btn-sm">
                Browse all services
              </Link>
            }
          />
        )}
        {services.data && services.data.content.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </div>
  )
}
