import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'

export default function NotFoundPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Compass className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900">Page not found</h1>
        <p className="muted mt-2">
          That page does not exist on Fixora. Try searching for the service you need, or head back to the homepage.
        </p>

        <div className="mt-6">
          <SearchBar />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn-primary btn-sm">
            Go to homepage
          </Link>
          <Link to="/search" className="btn-secondary btn-sm">
            Browse all services
          </Link>
          <Link to="/faq" className="btn-ghost btn-sm">
            Read the FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}
