import { FileText, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Deliberately a placeholder: Fixora is a learning project with no registered
 * business entity, so it must not pretend to have a legal policy.
 */
export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
          <FileText className="h-6 w-6 text-brand-600" />
          {isPrivacy ? 'Privacy notice' : 'Terms of use'}
        </h1>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            This is a placeholder page for a learning project. Fixora is not a commercial service, has no registered
            business entity and does not publish a binding privacy policy or terms of use here.
          </p>
        </div>

        {isPrivacy ? (
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600">
            <h2 className="text-base font-semibold text-ink-900">What the application stores</h2>
            <p>
              Account details you enter (name, email, phone, city), your saved addresses, your bookings, your reviews and
              any complaints you file. They live in the MySQL database created by this project's Docker Compose stack.
            </p>

            <h2 className="text-base font-semibold text-ink-900">How passwords are handled</h2>
            <p>
              In this version passwords are stored as plain text because the project intentionally omits Spring Security,
              JWT and BCrypt. That is unsafe. Never use a real password here, and add proper hashing before any real
              deployment.
            </p>

            <h2 className="text-base font-semibold text-ink-900">AI requests</h2>
            <p>
              When <code className="rounded bg-ink-100 px-1">AI_PROVIDER=fallback</code> (the default) the assistant
              answers locally from the database and nothing leaves your machine. If you configure an Anthropic API key,
              the text you type plus grounded catalogue data is sent to that API from the backend.
            </p>

            <h2 className="text-base font-semibold text-ink-900">Third-party images</h2>
            <p>
              Demo images are loaded from a public placeholder service. If the network is unavailable, the interface
              falls back to locally generated gradients and icons.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600">
            <h2 className="text-base font-semibold text-ink-900">Using this project</h2>
            <p>
              Fixora is provided as-is for learning and demonstration. Prices shown in the catalogue are demo prices and
              are not offers from any real business.
            </p>

            <h2 className="text-base font-semibold text-ink-900">Bookings and payments</h2>
            <p>
              A booking records a package price and a payment status. No payment is collected through the application and
              no refunds are processed automatically.
            </p>

            <h2 className="text-base font-semibold text-ink-900">Provider eligibility</h2>
            <p>
              Providers register with a Pending profile and are approved by an administrator. Fixora displays this real
              status and does not claim that providers have passed a background check.
            </p>

            <h2 className="text-base font-semibold text-ink-900">No warranty</h2>
            <p>
              The software is supplied without warranty of any kind. Do not deploy it publicly without adding real
              authentication, authorisation and password hashing.
            </p>
          </div>
        )}

        <p className="mt-8 text-sm">
          <Link to="/" className="font-semibold text-brand-700">
            Back to Fixora
          </Link>
        </p>
      </div>
    </div>
  )
}
