import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertTriangle } from 'lucide-react'
import { errorMessage } from '../api/client'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'

interface LoginForm {
  email: string
  password: string
}

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@fixora.local', password: 'Customer@123' },
  { label: 'Provider', email: 'provider@fixora.local', password: 'Provider@123' },
  { label: 'Admin', email: 'admin@fixora.local', password: 'Admin@123' },
]

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  async function onSubmit(values: LoginForm) {
    setServerError(null)
    try {
      const user = await signIn(values.email, values.password)
      const next = params.get('next')
      if (next) {
        navigate(next, { replace: true })
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'PROVIDER') {
        navigate('/provider', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      setServerError(errorMessage(error))
    }
  }

  function fillDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setValue('email', account.email)
    setValue('password', account.password)
  }

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <Logo className="mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Sign in to Fixora</h1>
        <p className="muted mt-1">Track bookings, manage addresses and review completed services.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {serverError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted mt-4">
          New to Fixora?{' '}
          <Link to="/register" className="font-semibold text-brand-700">
            Create an account
          </Link>
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-900">Development accounts</h2>
        <p className="muted mt-1">
          Seeded into MySQL on first start. These are development-only credentials with plain-text passwords — change
          them before any real deployment.
        </p>
        <ul className="mt-4 space-y-3">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900">{account.label}</p>
                <p className="truncate text-xs text-ink-500">
                  {account.email} · {account.password}
                </p>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={() => fillDemo(account)}>
                Use
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Fixora does not use JWT, Spring Security or password hashing in this version. Sign-in exists to
            demonstrate the flows, not to provide real security.
          </span>
        </div>
      </div>
    </div>
  )
}
