import { useState } from 'react'
import { adminApi } from '../../api'
import { Pagination } from '../../components/Pagination'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useAsync } from '../../hooks/useAsync'
import { formatDateTime, cn } from '../../utils/format'
import type { UserRole } from '../../types'

const ROLES: { label: string; value?: UserRole }[] = [
  { label: 'All' },
  { label: 'Customers', value: 'CUSTOMER' },
  { label: 'Providers', value: 'PROVIDER' },
  { label: 'Admins', value: 'ADMIN' },
]

export default function AdminUsersPage() {
  const [role, setRole] = useState<UserRole | undefined>(undefined)
  const [page, setPage] = useState(0)
  const users = useAsync(() => adminApi.users({ role, page, size: 20 }), [role, page])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Users</h2>
        <p className="muted mt-1">
          Passwords are never returned by the API — the user DTO has no password field at all.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROLES.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => {
              setRole(option.value)
              setPage(0)
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              role === option.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {users.loading && <Loader />}
      {users.error && <ErrorState error={users.error} onRetry={users.reload} />}
      {users.data && users.data.content.length === 0 && <EmptyState title="No users found" />}

      {users.data && users.data.content.length > 0 && (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.data.content.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-ink-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-ink-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="chip bg-ink-100 text-ink-700 ring-ink-200">{user.role}</span>
                      {user.providerStatus && (
                        <span className="ml-2 text-xs text-ink-500">{user.providerStatus}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{user.city ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={users.data.page}
            totalPages={users.data.totalPages}
            totalElements={users.data.totalElements}
            onChange={setPage}
          />
        </>
      )}
    </div>
  )
}
