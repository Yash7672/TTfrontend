import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { providerApi } from '../../api'
import { errorMessage } from '../../api/client'
import { ProviderStatusBadge } from '../../components/StatusBadge'
import { Loader } from '../../components/States'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { CITIES } from '../../utils/constants'

interface ProfileForm {
  businessName: string
  bio: string
  city: string
  area: string
  experienceYears: number
  profileImageUrl: string
}

export default function ProviderProfilePage() {
  const { refresh } = useAuth()
  const toast = useToast()
  const existing = useAsync(() => providerApi.me(), [])
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    defaultValues: {
      businessName: '',
      bio: '',
      city: 'Hyderabad',
      area: '',
      experienceYears: 1,
      profileImageUrl: '',
    },
  })

  const hasProfile = Boolean(existing.data)

  useEffect(() => {
    if (existing.data) {
      reset({
        businessName: existing.data.businessName,
        bio: existing.data.bio ?? '',
        city: existing.data.city ?? 'Hyderabad',
        area: existing.data.area ?? '',
        experienceYears: existing.data.experienceYears ?? 1,
        profileImageUrl: existing.data.profileImageUrl ?? '',
      })
    }
  }, [existing.data, reset])

  async function onSubmit(values: ProfileForm) {
    setServerError(null)
    const payload = {
      businessName: values.businessName,
      bio: values.bio || undefined,
      city: values.city,
      area: values.area || undefined,
      experienceYears: Number(values.experienceYears) || 0,
      profileImageUrl: values.profileImageUrl || undefined,
    }

    try {
      if (hasProfile) {
        await providerApi.updateMe(payload)
        toast.success('Provider profile updated.')
      } else {
        await providerApi.createMe(payload)
        toast.success('Provider profile created — it is now Pending review.')
      }
      existing.reload()
      await refresh()
    } catch (error) {
      const message = errorMessage(error)
      setServerError(message)
      toast.error(message)
    }
  }

  if (existing.loading) return <Loader label="Loading provider profile…" />

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {hasProfile ? 'Provider profile' : 'Create your provider profile'}
            </h2>
            <p className="muted mt-1">
              {hasProfile
                ? 'Editing a rejected or suspended profile sends it back to the admin review queue.'
                : 'New profiles are created with the status Pending and are reviewed by an administrator.'}
            </p>
          </div>
          {existing.data && <ProviderStatusBadge status={existing.data.status} />}
        </div>
      </div>

      <form className="card space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label" htmlFor="businessName">
            Business name
          </label>
          <input
            id="businessName"
            className="input"
            {...register('businessName', { required: 'Business name is required' })}
          />
          {errors.businessName && <p className="field-error">{errors.businessName.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="bio">
            About your service
          </label>
          <textarea id="bio" rows={4} className="input" {...register('bio')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="city">
              City
            </label>
            <select id="city" className="input" {...register('city', { required: true })}>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="area">
              Area / locality
            </label>
            <input id="area" className="input" {...register('area')} />
          </div>
          <div>
            <label className="label" htmlFor="experienceYears">
              Years of experience
            </label>
            <input
              id="experienceYears"
              type="number"
              min={0}
              className="input"
              {...register('experienceYears', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="profileImageUrl">
            Profile image URL (optional)
          </label>
          <input id="profileImageUrl" className="input" {...register('profileImageUrl')} />
          <p className="muted mt-1">
            Leave empty to use the generated Fixora placeholder. Uploaded files are not supported in this version.
          </p>
        </div>

        {serverError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{serverError}</p>
        )}

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : hasProfile ? 'Save profile' : 'Create provider profile'}
        </button>
      </form>
    </div>
  )
}
