import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { CalendarDays, Clock, Info, MapPin, UserRound } from 'lucide-react'
import { addressApi, bookingApi, catalogApi, providerApi } from '../api'
import { errorMessage } from '../api/client'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useCity } from '../context/CityContext'
import { useAsync } from '../hooks/useAsync'
import { addDaysIso, duration, inr, pricingNote, todayIso } from '../utils/format'
import type { BookingResponse } from '../types'

interface CheckoutForm {
  addressId: string
  providerId: string
  bookingDate: string
  startTime: string
  customerNotes: string
}

/** Half-hour slots inside the seeded provider working window. */
const TIME_SLOTS = Array.from({ length: 18 }, (_, index) => {
  const minutes = 9 * 60 + index * 30
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
})

export default function CheckoutPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [searchParams] = useSearchParams()
  const id = Number(serviceId)
  const packageId = Number(searchParams.get('packageId') ?? 0)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { city } = useCity()

  const service = useAsync(() => catalogApi.service(id), [id])
  const packages = useAsync(() => catalogApi.packages(id), [id])
  const addresses = useAsync(() => addressApi.list(), [user?.id])
  const providers = useAsync(() => providerApi.search({ serviceId: id, city, size: 10 }), [id, city])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      addressId: '',
      providerId: '',
      bookingDate: addDaysIso(1),
      startTime: '10:00',
      customerNotes: '',
    },
  })

  const selectedPackage = packages.data?.find((pkg) => pkg.id === packageId) ?? packages.data?.[0]
  const addressId = watch('addressId')

  // Preselect the default address (or the first one) once addresses load.
  useEffect(() => {
    if (!addressId && addresses.data && addresses.data.length > 0) {
      const preferred = addresses.data.find((address) => address.defaultAddress) ?? addresses.data[0]
      setValue('addressId', String(preferred.id))
    }
  }, [addresses.data, addressId, setValue])

  async function onSubmit(values: CheckoutForm) {
    if (!selectedPackage) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const booking: BookingResponse = await bookingApi.create({
        packageId: selectedPackage.id,
        providerId: values.providerId ? Number(values.providerId) : undefined,
        addressId: Number(values.addressId),
        bookingDate: values.bookingDate,
        startTime: values.startTime,
        customerNotes: values.customerNotes || undefined,
      })
      navigate(`/bookings/${booking.id}/confirmation`, { replace: true })
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (packages.error || service.error) {
    return (
      <div className="container-page py-10">
        <ErrorState error={(service.error ?? packages.error)!} onRetry={packages.reload} />
      </div>
    )
  }

  if (packages.loading || service.loading || !selectedPackage) {
    return (
      <div className="container-page py-10">
        <Loader label="Preparing checkout…" />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <nav className="muted" aria-label="Breadcrumb">
        <Link to={`/services/${id}`} className="hover:text-brand-700">
          {service.data?.name ?? 'Service'}
        </Link>{' '}
        / <span className="text-ink-700">Checkout</span>
      </nav>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">Confirm your booking</h1>
      <p className="muted mt-1">
        Fixora validates the service, package, provider approval, provider availability and overlapping bookings on the
        server before saving anything.
      </p>

      {addresses.data && addresses.data.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Add a service address first"
            description="A booking must use an address that belongs to your account."
            icon={<MapPin className="h-6 w-6" />}
            action={
              <Link to="/addresses" className="btn-primary btn-sm">
                Manage addresses
              </Link>
            }
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <form className="card space-y-5 p-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label" htmlFor="addressId">
              Service address
            </label>
            <select
              id="addressId"
              className="input"
              {...register('addressId', { required: 'Choose an address' })}
              disabled={!addresses.data || addresses.data.length === 0}
            >
              <option value="">Select an address</option>
              {(addresses.data ?? []).map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label ? `${address.label} — ` : ''}
                  {address.fullAddress}
                </option>
              ))}
            </select>
            {errors.addressId && <p className="field-error">{errors.addressId.message}</p>}
            <Link to="/addresses" className="mt-2 inline-block text-xs font-semibold text-brand-700">
              + Add or edit addresses
            </Link>
          </div>

          <div>
            <label className="label" htmlFor="providerId">
              Preferred provider (optional)
            </label>
            <select id="providerId" className="input" {...register('providerId')}>
              <option value="">Let Fixora assign an approved provider</option>
              {(providers.data?.content ?? []).map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.businessName}
                  {provider.ratingCount > 0 ? ` · ${provider.ratingAverage.toFixed(1)}★` : ''}
                </option>
              ))}
            </select>
            <p className="muted mt-1">
              Choosing a provider checks that they offer this service and are free at your selected time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="bookingDate">
                Date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="bookingDate"
                  type="date"
                  min={todayIso()}
                  className="input pl-9"
                  {...register('bookingDate', { required: 'Choose a date' })}
                />
              </div>
              {errors.bookingDate && <p className="field-error">{errors.bookingDate.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="startTime">
                Start time
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <select id="startTime" className="input pl-9" {...register('startTime', { required: true })}>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="customerNotes">
              Notes for the provider (optional)
            </label>
            <textarea
              id="customerNotes"
              rows={3}
              className="input"
              placeholder="Access instructions, the exact problem, parking details…"
              {...register('customerNotes')}
            />
          </div>

          <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            <p className="flex items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>
                The price is calculated by the server from the package you selected. If you submit a price it is ignored.
              </span>
            </p>
          </div>

          {submitError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating your booking…' : 'Confirm booking'}
          </button>
        </form>

        <aside className="card h-fit p-6">
          <h2 className="text-sm font-semibold text-ink-900">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-ink-500">Service</dt>
              <dd className="text-right font-medium text-ink-900">{service.data?.name}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-ink-500">Package</dt>
              <dd className="text-right font-medium text-ink-900">{selectedPackage.name}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-ink-500">Duration</dt>
              <dd className="text-right font-medium text-ink-900">{duration(selectedPackage.durationMinutes)}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 border-t border-ink-100 pt-3">
              <dt className="text-ink-500">Agreed price</dt>
              <dd className="text-right text-lg font-bold text-ink-900">{inr(selectedPackage.price)}</dd>
            </div>
          </dl>

          <p className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            {pricingNote(selectedPackage.pricingType)}
          </p>

          <div className="mt-4 space-y-2 text-xs text-ink-500">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {addresses.data?.find((address) => String(address.id) === addressId)?.fullAddress ??
                'Choose an address to continue'}
            </p>
            <p className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              Booking for {user?.fullName}
            </p>
          </div>

          <p className="mt-4 text-[11px] text-ink-400">
            No payment is taken online. The booking stores a payment status and you settle with the provider.
          </p>
        </aside>
      </div>
    </div>
  )
}
