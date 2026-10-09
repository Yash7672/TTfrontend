import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { errorMessage } from '../api/client'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { CITIES } from '../utils/constants'
import type { UserRole } from '../types'

interface RegisterForm {
  fullName: string
  email: string
  password: string
  phone: string
  role: UserRole
  businessName: string
  city: string
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      role: 'CUSTOMER',
      businessName: '',
      city: 'Hyderabad',
    },
  })

  const role = watch('role')

  async function onSubmit(values: RegisterForm) {
    setServerError(null)
    try {
      const user = await signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
        businessName: values.role === 'PROVIDER' ? values.businessName || undefined : undefined,
        city: values.city,
      })
      navigate(user.role === 'PROVIDER' ? '/provider/profile' : '/', { replace: true })
    } catch (error) {
      setServerError(errorMessage(error))
    }
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto w-full max-w-xl">
        <Logo className="mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your Fixora account</h1>
        <p className="muted mt-1">
          Customer accounts can book instantly. Provider accounts are created with the status Pending until an
          administrator approves them.
        </p>

        <form className="card mt-6 space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-xl border p-3 text-sm ${role === 'CUSTOMER' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
              <input type="radio" value="CUSTOMER" className="sr-only" {...register('role')} />
              <span className="font-semibold text-ink-900">I need services</span>
              <span className="mt-0.5 block text-xs text-ink-500">Customer account</span>
            </label>
            <label className={`cursor-pointer rounded-xl border p-3 text-sm ${role === 'PROVIDER' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
              <input type="radio" value="PROVIDER" className="sr-only" {...register('role')} />
              <span className="font-semibold text-ink-900">I provide services</span>
              <span className="mt-0.5 block text-xs text-ink-500">Provider account</span>
            </label>
          </div>

          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className="input"
              {...register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'Too short' } })}
            />
            {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
          </div>

          {role === 'PROVIDER' && (
            <div>
              <label className="label" htmlFor="businessName">
                Business name
              </label>
              <input id="businessName" className="input" placeholder="e.g. Hyderabad Home Experts" {...register('businessName')} />
              <p className="muted mt-1">Shown to customers in provider search and on service pages.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Phone (optional)
              </label>
              <input id="phone" className="input" {...register('phone')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="city">
                City
              </label>
              <select id="city" className="input" {...register('city')}>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {serverError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-xs text-ink-400">
            Passwords are stored as plain text in this learning version. Never reuse a real password.
          </p>
        </form>

        <p className="muted mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
