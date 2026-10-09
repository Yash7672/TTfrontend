import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Pencil, Star, Trash2 } from 'lucide-react'
import { addressApi } from '../api'
import { errorMessage } from '../api/client'
import { EmptyState, ErrorState, Loader } from '../components/States'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { CITIES } from '../utils/constants'
import type { AddressResponse, AddressType } from '../types'

interface AddressForm {
  label: string
  line1: string
  line2: string
  city: string
  area: string
  pincode: string
  addressType: AddressType
  defaultAddress: boolean
}

export default function AddressesPage() {
  const toast = useToast()
  const addresses = useAsync(() => addressApi.list(), [])
  const [editing, setEditing] = useState<AddressResponse | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: 'Hyderabad',
      area: '',
      pincode: '',
      addressType: 'HOME',
      defaultAddress: false,
    },
  })

  function startEdit(address: AddressResponse) {
    setEditing(address)
    setFormError(null)
    reset({
      label: address.label ?? '',
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      area: address.area ?? '',
      pincode: address.pincode ?? '',
      addressType: address.addressType,
      defaultAddress: address.defaultAddress,
    })
  }

  function startCreate() {
    setEditing(null)
    setFormError(null)
    reset({
      label: '',
      line1: '',
      line2: '',
      city: 'Hyderabad',
      area: '',
      pincode: '',
      addressType: 'HOME',
      defaultAddress: false,
    })
  }

  async function onSubmit(values: AddressForm) {
    setFormError(null)
    try {
      if (editing) {
        await addressApi.update(editing.id, values)
        toast.success('Address updated.')
      } else {
        await addressApi.create(values)
        toast.success('Address added.')
      }
      startCreate()
      addresses.reload()
    } catch (error) {
      const message = errorMessage(error)
      setFormError(message)
      toast.error(message)
    }
  }

  async function remove(address: AddressResponse) {
    try {
      await addressApi.remove(address.id)
      toast.success('Address removed.')
      addresses.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function makeDefault(address: AddressResponse) {
    try {
      await addressApi.setDefault(address.id)
      toast.success('Default address updated.')
      addresses.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">My addresses</h1>
      <p className="muted mt-1">
        A booking can only use an address that belongs to your account — the backend checks ownership on every request.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="space-y-4">
          {addresses.loading && <Loader />}
          {addresses.error && <ErrorState error={addresses.error} onRetry={addresses.reload} />}
          {addresses.data && addresses.data.length === 0 && (
            <EmptyState
              title="No addresses yet"
              description="Add your first address to start booking services."
              icon={<MapPin className="h-6 w-6" />}
            />
          )}
          {addresses.data?.map((address) => (
            <article key={address.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    {address.label || address.addressType}
                    {address.defaultAddress && (
                      <span className="chip bg-brand-50 text-brand-700 ring-brand-200">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </p>
                  <p className="muted mt-1">{address.fullAddress}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className="btn-ghost btn-sm" onClick={() => startEdit(address)} aria-label="Edit address">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => void remove(address)} aria-label="Delete address">
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
              {!address.defaultAddress && (
                <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => void makeDefault(address)}>
                  Set as default
                </button>
              )}
            </article>
          ))}
        </section>

        <form className="card h-fit space-y-4 p-6" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-sm font-semibold text-ink-900">{editing ? 'Edit address' : 'Add a new address'}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="label">
                Label
              </label>
              <input id="label" className="input" placeholder="Home, Work…" {...register('label')} />
            </div>
            <div>
              <label className="label" htmlFor="addressType">
                Type
              </label>
              <select id="addressType" className="input" {...register('addressType')}>
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="line1">
              Address line 1
            </label>
            <input id="line1" className="input" {...register('line1', { required: 'Address line 1 is required' })} />
            {errors.line1 && <p className="field-error">{errors.line1.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="line2">
              Address line 2
            </label>
            <input id="line2" className="input" {...register('line2')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="area">
                Area
              </label>
              <input id="area" className="input" {...register('area')} />
            </div>
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
              <label className="label" htmlFor="pincode">
                Pincode
              </label>
              <input id="pincode" className="input" {...register('pincode')} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register('defaultAddress')} />
            Use as my default address
          </label>

          {formError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add address'}
            </button>
            {editing && (
              <button type="button" className="btn-secondary" onClick={startCreate}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
