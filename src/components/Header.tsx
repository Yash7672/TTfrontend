import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Menu, Sparkles, User, X } from 'lucide-react'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { CitySelector, SearchBar } from './SearchBar'
import { useAuth } from '../context/AuthContext'
import { useCity } from '../context/CityContext'
import { cn, initials } from '../utils/format'

export function Header() {
  const { user, signOut } = useAuth()
  const { city } = useCity()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSignOut() {
    signOut()
    setMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    )

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-4 py-3">
        <Logo />

        <div className="hidden flex-1 items-center gap-3 lg:flex">
          <CitySelector />
          <SearchBar className="max-w-xl" />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={navLink} end>
            Home
          </NavLink>
          <NavLink to="/search" className={navLink}>
            Services
          </NavLink>
          <NavLink to="/assistant" className={navLink}>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              AI assistant
            </span>
          </NavLink>
          {user?.role === 'PROVIDER' && (
            <NavLink to="/provider" className={navLink}>
              Provider
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLink}>
              Admin
            </NavLink>
          )}

          <NotificationBell />

          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-ink-100"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {initials(user.fullName)}
                </span>
                <ChevronDown className="h-4 w-4 text-ink-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-card">
                  <div className="border-b border-ink-100 px-4 py-2">
                    <p className="truncate text-sm font-semibold text-ink-900">{user.fullName}</p>
                    <p className="truncate text-xs text-ink-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My profile
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    My bookings
                  </Link>
                  {user.role === 'PROVIDER' && (
                    <Link
                      to="/provider"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Provider dashboard
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="ml-auto rounded-xl p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white lg:hidden">
          <div className="container-page space-y-3 py-4">
            <SearchBar className="w-full" />
            <CitySelector className="w-full" />
            <div className="flex flex-col">
              <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link to="/search" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                Services
              </Link>
              <Link to="/assistant" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                AI assistant
              </Link>
              <Link to="/faq" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                FAQ
              </Link>
              <Link to="/support" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                Support
              </Link>
              <Link to="/become-provider" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                Become a provider
              </Link>
              {user ? (
                <>
                  <Link to="/bookings" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                    My bookings
                  </Link>
                  <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                    My profile
                  </Link>
                  {user.role === 'PROVIDER' && (
                    <Link to="/provider" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                      Provider dashboard
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700" onClick={() => setMobileOpen(false)}>
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3 pt-1">
                  <Link to="/login" className="btn-secondary btn-sm" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </div>
              )}
              <p className="px-3 pt-2 text-xs text-ink-400">Selected city: {city}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
