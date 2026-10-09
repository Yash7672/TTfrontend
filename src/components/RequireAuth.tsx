import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Loader } from './States'
import type { UserRole } from '../types'

/**
 * Frontend route guard.
 *
 * IMPORTANT: this only improves usability. It is NOT a security boundary — the
 * backend re-checks ownership and roles on every request (see
 * CurrentUserIdArgumentResolver). The README states this explicitly.
 */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader label="Checking your session…" />
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <EmptyState
        title="This area is for a different account type"
        description={`You are signed in as ${user.role.toLowerCase()}. Sign in with a matching account to continue. Frontend routing is a convenience only — the API also rejects unauthorised actions.`}
      />
    )
  }

  return <>{children}</>
}
