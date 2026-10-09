import { Link } from 'react-router-dom'
import { BadgeCheck, CalendarCheck, ClipboardList, ShieldCheck, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: '1. Register as a provider',
    body: 'Create an account with the Provider role. Your profile starts with the status Pending.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: '2. Admin verification',
    body: 'An administrator reviews your profile. Only Approved providers appear in customer search.',
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: '3. List your services',
    body: 'Add the Fixora services you actually deliver, with an optional price override.',
  },
  {
    icon: <CalendarCheck className="h-5 w-5" />,
    title: '4. Publish availability',
    body: 'Set your weekly working windows. Bookings outside those hours are rejected by the server.',
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: '5. Accept and complete jobs',
    body: 'Manage incoming requests, start and complete the work, then see your earnings estimate.',
  },
]

export default function BecomeProviderPage() {
  const { user } = useAuth()

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
            Earn by offering local services on Fixora
          </h1>
          <p className="mt-3 text-ink-600">
            Fixora is a marketplace for local home services. Providers publish the services they offer and the hours
            they work; customers book a package and track the job from request to completion.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {user?.role === 'PROVIDER' ? (
              <Link to="/provider" className="btn-primary">
                Open provider dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-primary">
                Register as a provider
              </Link>
            )}
            {!user && (
              <Link to="/login" className="btn-secondary">
                I already have an account
              </Link>
            )}
          </div>

          <p className="mt-4 text-xs text-ink-400">
            Fixora is a learning project: no payment gateway is connected and no commission is charged. Earnings shown
            in the dashboard are an estimate calculated from completed bookings in this database.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-ink-900">What you get</h2>
          <ul className="mt-3 space-y-3 text-sm text-ink-600">
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              A provider workspace with bookings, reviews and earnings
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              Server-side validation so double bookings are rejected
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              Real review scores only from completed bookings
            </li>
          </ul>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="section-title">How verification works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <div key={step.title} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                {step.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
