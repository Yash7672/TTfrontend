import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { cn } from '../utils/format'

export interface DashboardNavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

/**
 * Shared shell for the provider and admin areas: a persistent sidebar on desktop
 * and a scrollable tab strip on mobile.
 */
export function DashboardLayout({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: DashboardNavItem[]
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Header />

      <div className="container-page flex-1 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          <p className="muted mt-1">{subtitle}</p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-ink-600 hover:bg-ink-100 lg:bg-transparent',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="min-w-0 flex-1 space-y-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
