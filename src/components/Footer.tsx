import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { useAsync } from '../hooks/useAsync'
import { catalogApi } from '../api'

export function Footer() {
  const { data: categories } = useAsync(() => catalogApi.categories(), [])

  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-ink-500">
            Fixora is a smart local services marketplace: discover services, compare packages with clear pricing,
            book a professional and track the job from request to completion.
          </p>
          <p className="text-xs text-ink-400">
            Learning project · prices shown are demo prices · no real payments are processed.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Categories</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            {(categories ?? []).slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link to={`/category/${category.id}`} className="hover:text-brand-700">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/search" className="font-medium text-brand-700">
                Browse all services
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Customer support</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li>
              <Link to="/faq" className="hover:text-brand-700">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-brand-700">
                Raise a complaint
              </Link>
            </li>
            <li>
              <Link to="/assistant" className="hover:text-brand-700">
                AI assistant
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-brand-700">
                Track a booking
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900">Providers &amp; legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li>
              <Link to="/become-provider" className="hover:text-brand-700">
                Become a provider
              </Link>
            </li>
            <li>
              <Link to="/provider" className="hover:text-brand-700">
                Provider dashboard
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-brand-700">
                Privacy notice (placeholder)
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-brand-700">
                Terms of use (placeholder)
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-ink-400">
            Contact: support@fixora.local (placeholder — no real support line is operated for this project).
          </p>
        </div>
      </div>

      <div className="border-t border-ink-100 py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Fixora. Learning project, not a commercial service.</p>
          <p>Built with Spring Boot, React, MySQL and Docker.</p>
        </div>
      </div>
    </footer>
  )
}
