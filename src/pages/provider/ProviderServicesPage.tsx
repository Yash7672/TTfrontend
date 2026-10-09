import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { catalogApi, providerApi } from '../../api'
import { errorMessage } from '../../api/client'
import { EmptyState, ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { inr } from '../../utils/format'

export default function ProviderServicesPage() {
  const toast = useToast()
  const mine = useAsync(() => providerApi.myServices(), [])
  const categories = useAsync(() => catalogApi.categories(), [])

  const [serviceId, setServiceId] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Load the catalogue for the chosen category so the provider picks a real service.
  const [categoryId, setCategoryId] = useState('')
  const services = useAsync(
    () => (categoryId ? catalogApi.categoryServices(Number(categoryId), 0, 60) : Promise.resolve(null)),
    [categoryId],
  )

  async function addService(event: React.FormEvent) {
    event.preventDefault()
    if (!serviceId) {
      setError('Choose a service from the catalogue first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await providerApi.addMyService({
        serviceId: Number(serviceId),
        customPrice: customPrice ? Number(customPrice) : undefined,
      })
      toast.success('Service added to your offering list.')
      setServiceId('')
      setCustomPrice('')
      mine.reload()
    } catch (caught) {
      const message = errorMessage(caught)
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function removeService(id: number) {
    try {
      await providerApi.removeMyService(id)
      toast.success('Service removed.')
      mine.reload()
    } catch (caught) {
      toast.error(errorMessage(caught))
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-ink-900">Services you offer</h2>
        <p className="muted mt-1">
          Customers can only book you for services in this list. Removing a service that already has bookings deactivates
          it instead of deleting the history.
        </p>

        <div className="mt-4 space-y-3">
          {mine.loading && <Loader />}
          {mine.error && <ErrorState error={mine.error} onRetry={mine.reload} />}
          {mine.data && mine.data.length === 0 && (
            <EmptyState title="No services yet" description="Add the services you actually deliver." />
          )}
          {mine.data?.map((offering) => (
            <div key={offering.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {offering.categoryName}
                </p>
                <p className="text-sm font-semibold text-ink-900">{offering.serviceName}</p>
                <p className="muted">
                  {offering.customPrice
                    ? `Your price ${inr(offering.customPrice)}`
                    : `Catalogue price from ${inr(offering.cataloguePrice)}`}
                  {!offering.active && ' · deactivated (kept for booking history)'}
                </p>
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => void removeService(offering.id)}>
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <form className="card space-y-4 p-6" onSubmit={addService}>
        <h2 className="text-lg font-bold text-ink-900">Add a service</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              className="input"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value)
                setServiceId('')
              }}
            >
              <option value="">Select a category</option>
              {(categories.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="serviceId">
              Service
            </label>
            <select
              id="serviceId"
              className="input"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              disabled={!services.data}
            >
              <option value="">{services.data ? 'Select a service' : 'Choose a category first'}</option>
              {(services.data?.content ?? []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} (from {inr(service.basePrice)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="customPrice">
            Your price override (optional)
          </label>
          <input
            id="customPrice"
            type="number"
            min={0}
            className="input"
            value={customPrice}
            onChange={(event) => setCustomPrice(event.target.value)}
            placeholder="Leave empty to use the catalogue package price"
          />
        </div>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          <Plus className="h-4 w-4" />
          {busy ? 'Adding…' : 'Add service'}
        </button>
      </form>
    </div>
  )
}
