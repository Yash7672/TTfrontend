import { Link } from 'react-router-dom'
import { adminApi } from '../../api'
import { ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'

export default function AdminDashboardPage() {
  const dashboard = useAsync(() => adminApi.dashboard(), [])

  if (dashboard.loading) return <Loader label="Counting rows in MySQL…" />
  if (dashboard.error) return <ErrorState error={dashboard.error} onRetry={dashboard.reload} />

  const data = dashboard.data!

  const groups: { title: string; items: { label: string; value: number | string }[] }[] = [
    {
      title: 'People',
      items: [
        { label: 'Total users', value: data.totalUsers },
        { label: 'Customers', value: data.totalCustomers },
        { label: 'Providers', value: data.totalProviders },
        { label: 'Approved providers', value: data.approvedProviders },
        { label: 'Pending providers', value: data.pendingProviders },
        { label: 'Rejected providers', value: data.rejectedProviders },
        { label: 'Suspended providers', value: data.suspendedProviders },
      ],
    },
    {
      title: 'Catalogue',
      items: [
        { label: 'Categories', value: data.totalCategories },
        { label: 'Services', value: data.totalServices },
        { label: 'Packages', value: data.totalPackages },
      ],
    },
    {
      title: 'Bookings',
      items: [
        { label: 'Total bookings', value: data.totalBookings },
        { label: 'Pending', value: data.pendingBookings },
        { label: 'Accepted', value: data.acceptedBookings },
        { label: 'In progress', value: data.inProgressBookings },
        { label: 'Completed', value: data.completedBookings },
        { label: 'Cancelled', value: data.cancelledBookings },
        { label: 'Rejected', value: data.rejectedBookings },
      ],
    },
    {
      title: 'Feedback',
      items: [
        { label: 'Reviews', value: data.totalReviews },
        { label: 'Complaints open', value: data.openComplaints },
        { label: 'Complaints in progress', value: data.inProgressComplaints },
        { label: 'Complaints resolved', value: data.resolvedComplaints },
        { label: 'Complaints closed', value: data.closedComplaints },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Live platform counters</h2>
          <p className="muted mt-1">
            Every number below is a COUNT query against MySQL at request time — nothing is mocked or hardcoded.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-ink-100 text-ink-700 ring-ink-200">AI provider: {data.aiProvider}</span>
          <span className="chip bg-brand-50 text-brand-700 ring-brand-200">AI mode: {data.aiMode}</span>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.title}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">{group.title}</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((item) => (
              <div key={item.label} className="card p-4">
                <p className="text-xs font-medium text-ink-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-ink-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink-900">Needs attention</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link to="/admin/providers" className="text-brand-700 hover:underline">
              {data.pendingProviders} provider{data.pendingProviders === 1 ? '' : 's'} waiting for approval
            </Link>
          </li>
          <li>
            <Link to="/admin/complaints" className="text-brand-700 hover:underline">
              {data.openComplaints} open complaint{data.openComplaints === 1 ? '' : 's'}
            </Link>
          </li>
          <li>
            <Link to="/admin/bookings" className="text-brand-700 hover:underline">
              {data.pendingBookings} pending booking{data.pendingBookings === 1 ? '' : 's'}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
