import { Info } from 'lucide-react'
import { providerApi } from '../../api'
import { ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'
import { inr, titleCase } from '../../utils/format'

export default function ProviderEarningsPage() {
  const earnings = useAsync(() => providerApi.earnings(), [])

  if (earnings.loading) return <Loader label="Calculating earnings…" />
  if (earnings.error) return <ErrorState error={earnings.error} onRetry={earnings.reload} />

  const summary = earnings.data ?? {}
  const byStatus = (summary.bookingsByStatus ?? {}) as Record<string, number>

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">Earnings estimate</h2>
        <p className="muted mt-1">
          Calculated from the agreed price of your completed bookings in the Fixora database.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Completed value</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{inr(Number(summary.completedValue ?? 0))}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Completed jobs</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{String(summary.completedBookings ?? 0)}</p>
          </div>
          <div className="rounded-2xl border border-ink-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Rating</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">
              {Number(summary.reviewCount ?? 0) > 0
                ? `${Number(summary.averageRating ?? 0).toFixed(2)} / 5`
                : 'No reviews yet'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink-900">Bookings by status</h3>
        <ul className="mt-3 divide-y divide-ink-100">
          {Object.entries(byStatus).map(([status, count]) => (
            <li key={status} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink-600">{titleCase(status)}</span>
              <span className="font-semibold text-ink-900">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="flex items-start gap-2 text-xs text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <span>{String(summary.estimateDisclaimer ?? 'No payment gateway is connected in this version.')}</span>
      </p>
    </div>
  )
}
