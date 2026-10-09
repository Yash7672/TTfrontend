import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, ShieldAlert, Sparkles } from 'lucide-react'
import { userApi } from '../api'
import { errorMessage } from '../api/client'
import { ProviderStatusBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CITIES } from '../utils/constants'

interface ProfileForm {
  fullName: string
  phone: string
  city: string
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({ defaultValues: { fullName: '', phone: '', city: '' } })

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName, phone: user.phone ?? '', city: user.city ?? 'Hyderabad' })
    }
  }, [user, reset])

  async function onSubmit(values: ProfileForm) {
    setServerError(null)
    try {
      const updated = await userApi.updateMe({
        fullName: values.fullName,
        phone: values.phone || undefined,
        city: values.city || undefined,
      })
      setUser(updated)
      toast.success('Profile updated.')
      reset({ fullName: updated.fullName, phone: updated.phone ?? '', city: updated.city ?? '' })
    } catch (error) {
      const message = errorMessage(error)
      setServerError(message)
      toast.error(message)
    }
  }

  if (!user) return null

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">My profile</h1>
      <p className="muted mt-1">Update your details and check your account type.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <form className="card space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input id="fullName" className="input" {...register('fullName', { required: 'Name is required' })} />
            {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email (cannot be changed)
            </label>
            <input id="email" className="input bg-ink-50" value={user.email} readOnly />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">
                Phone
              </label>
              <input id="phone" className="input" {...register('phone')} />
            </div>
            <div>
              <label className="label" htmlFor="city">
                Preferred city
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
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</p>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Account</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Role</dt>
                <dd className="font-medium text-ink-900">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Status</dt>
                <dd className="font-medium text-ink-900">{user.active ? 'Active' : 'Deactivated'}</dd>
              </div>
              {user.providerStatus && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Provider profile</dt>
                  <dd>
                    <ProviderStatusBadge status={user.providerStatus} />
                  </dd>
                </div>
              )}
            </dl>

            {user.role === 'PROVIDER' && user.providerStatus !== 'APPROVED' && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Your provider profile is {user.providerStatus?.toLowerCase()}. It will not appear in customer search
                until an administrator approves it.
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/addresses" className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700">
                  <MapPin className="h-4 w-4" />
                  Manage addresses
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700">
                  <Sparkles className="h-4 w-4" />
                  My bookings
                </Link>
              </li>
              <li>
                <Link to="/support" className="inline-flex items-center gap-2 text-ink-700 hover:text-brand-700">
                  <ShieldAlert className="h-4 w-4" />
                  Raise a complaint
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
