import { useState } from 'react'
import { CheckCircle2, Ban, XCircle } from 'lucide-react'
import { adminApi } from '../../api'
import { errorMessage } from '../../api/client'
import { ProviderStatusBadge } from '../../components/StatusBadge'
import { Pagination } from '../../components/Pagination'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { cn, formatDateTime } from '../../utils/format'
import type { ProviderStatus } from '../../types'

const FILTERS: { label: string; value?: ProviderStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

export default function AdminProvidersPage() {
  const toast = useToast()
  const [status, setStatus] = useState<ProviderStatus | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [busyId, setBusyId] = useState<number | null>(null)
  const providers = useAsync(() => adminApi.providers({ status, page, size: 20 }), [status, page])

  async function setProviderStatus(id: number, next: ProviderStatus) {
    setBusyId(id)
    try {
      await adminApi.verifyProvider(id, { status: next, note: `Set to ${next} from the admin panel.` })
      toast.success(`Provider marked as ${next.toLowerCase()}.`)
      providers.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Provider verification</h2>
        <p className="muted mt-1">
          Only APPROVED providers appear in customer search and can accept bookings. The status change is applied by the
          backend and the provider is notified in-app.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatus(filter.value)
              setPage(0)
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              status === filter.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {providers.loading && <Loader />}
      {providers.error && <ErrorState error={providers.error} onRetry={providers.reload} />}
      {providers.data && providers.data.content.length === 0 && (
        <EmptyState title="No providers in this state" description="Nothing waiting for your review here." />
      )}

      <div className="space-y-4">
        {providers.data?.content.map((provider) => (
          <article key={provider.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{provider.businessName}</h3>
                <p className="muted mt-1">
                  {provider.area ? `${provider.area}, ` : ''}
                  {provider.city ?? 'No city'} · {provider.serviceCount} services ·{' '}
                  {provider.ratingCount > 0 ? `${provider.ratingAverage.toFixed(1)}★ (${provider.ratingCount})` : 'no reviews'}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Contact: {provider.contactName ?? '—'} · registered {formatDateTime((provider as unknown as { createdAt?: string }).createdAt)}
                </p>
                {provider.bio && <p className="mt-2 max-w-2xl text-sm text-ink-600">{provider.bio}</p>}
              </div>
              <ProviderStatusBadge status={provider.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary btn-sm"
                disabled={busyId === provider.id || provider.status === 'APPROVED'}
                onClick={() => void setProviderStatus(provider.id, 'APPROVED')}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                disabled={busyId === provider.id || provider.status === 'REJECTED'}
                onClick={() => void setProviderStatus(provider.id, 'REJECTED')}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                disabled={busyId === provider.id || provider.status === 'SUSPENDED'}
                onClick={() => void setProviderStatus(provider.id, 'SUSPENDED')}
              >
                <Ban className="h-3.5 w-3.5" />
                Suspend
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                disabled={busyId === provider.id || provider.status === 'PENDING'}
                onClick={() => void setProviderStatus(provider.id, 'PENDING')}
              >
                Back to review
              </button>
            </div>
          </article>
        ))}
      </div>

      {providers.data && providers.data.content.length > 0 && (
        <Pagination
          page={providers.data.page}
          totalPages={providers.data.totalPages}
          totalElements={providers.data.totalElements}
          onChange={setPage}
        />
      )}
    </div>
  )
}
