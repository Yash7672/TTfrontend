import { useState } from 'react'
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { adminApi, aiApi, catalogApi } from '../../api'
import { errorMessage } from '../../api/client'
import { CategoryIcon } from '../../components/CategoryIcon'
import { ErrorState, Loader } from '../../components/States'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { cn, inr } from '../../utils/format'
import type { CategoryResponse, GeneratedDescriptionResponse, PricingType, ServiceResponse } from '../../types'

type Tab = 'categories' | 'services' | 'packages'

const PRICING_TYPES: PricingType[] = ['FIXED_PRICE', 'STARTING_PRICE', 'INSPECTION_FEE', 'QUOTATION']

export default function AdminCataloguePage() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('categories')

  const categories = useAsync(() => catalogApi.categories(), [])
  const services = useAsync(() => adminApi.services(0, 60), [])

  // ------------------------------------------------------------- categories
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: '', description: '', iconName: 'sparkles', displayOrder: 0 })
  const [categoryBusy, setCategoryBusy] = useState(false)

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault()
    setCategoryBusy(true)
    try {
      const body = {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        iconName: categoryForm.iconName || undefined,
        displayOrder: Number(categoryForm.displayOrder) || 0,
        active: true,
      }
      if (categoryForm.id) {
        await adminApi.updateCategory(categoryForm.id, body)
        toast.success('Category updated.')
      } else {
        await adminApi.createCategory(body)
        toast.success('Category created.')
      }
      setCategoryForm({ id: 0, name: '', description: '', iconName: 'sparkles', displayOrder: 0 })
      categories.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setCategoryBusy(false)
    }
  }

  async function deleteCategory(id: number) {
    try {
      await adminApi.deleteCategory(id)
      toast.success('Category deleted.')
      categories.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  // --------------------------------------------------------------- services
  const [serviceForm, setServiceForm] = useState({
    id: 0,
    name: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    basePrice: 499,
    pricingType: 'FIXED_PRICE' as PricingType,
    durationMinutes: 60,
    featured: false,
  })
  const [serviceBusy, setServiceBusy] = useState(false)

  async function saveService(event: React.FormEvent) {
    event.preventDefault()
    setServiceBusy(true)
    try {
      const body = {
        name: serviceForm.name,
        categoryId: Number(serviceForm.categoryId),
        shortDescription: serviceForm.shortDescription || undefined,
        description: serviceForm.description || undefined,
        basePrice: Number(serviceForm.basePrice),
        pricingType: serviceForm.pricingType,
        durationMinutes: Number(serviceForm.durationMinutes),
        active: true,
        featured: serviceForm.featured,
      }
      if (serviceForm.id) {
        await adminApi.updateService(serviceForm.id, body)
        toast.success('Service updated.')
      } else {
        await adminApi.createService(body)
        toast.success('Service created.')
      }
      setServiceForm({ id: 0, name: '', categoryId: '', shortDescription: '', description: '', basePrice: 499, pricingType: 'FIXED_PRICE', durationMinutes: 60, featured: false })
      services.reload()
      categories.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setServiceBusy(false)
    }
  }

  function editService(service: ServiceResponse) {
    setServiceForm({
      id: service.id,
      name: service.name,
      categoryId: String(service.categoryId),
      shortDescription: service.shortDescription ?? '',
      description: service.description ?? '',
      basePrice: service.basePrice,
      pricingType: service.pricingType,
      durationMinutes: service.durationMinutes,
      featured: service.featured,
    })
    setTab('services')
  }

  async function deleteService(id: number) {
    try {
      await adminApi.deleteService(id)
      toast.success('Service deleted.')
      services.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  // --------------------------------------------------------------- packages
  const [packageServiceId, setPackageServiceId] = useState('')
  const packages = useAsync(
    () => (packageServiceId ? catalogApi.packages(Number(packageServiceId)) : Promise.resolve(null)),
    [packageServiceId],
  )
  const [packageForm, setPackageForm] = useState({
    name: '',
    price: 499,
    durationMinutes: 60,
    pricingType: 'FIXED_PRICE' as PricingType,
    description: '',
    includedWork: '',
    excludedWork: '',
  })
  const [packageBusy, setPackageBusy] = useState(false)

  async function savePackage(event: React.FormEvent) {
    event.preventDefault()
    if (!packageServiceId) {
      toast.error('Choose a service for this package first.')
      return
    }
    setPackageBusy(true)
    try {
      await adminApi.createPackage({
        serviceId: Number(packageServiceId),
        name: packageForm.name,
        price: Number(packageForm.price),
        durationMinutes: Number(packageForm.durationMinutes),
        pricingType: packageForm.pricingType,
        description: packageForm.description || undefined,
        includedWork: packageForm.includedWork || undefined,
        excludedWork: packageForm.excludedWork || undefined,
        active: true,
        displayOrder: 0,
      })
      toast.success('Package created.')
      setPackageForm({ name: '', price: 499, durationMinutes: 60, pricingType: 'FIXED_PRICE', description: '', includedWork: '', excludedWork: '' })
      packages.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPackageBusy(false)
    }
  }

  async function deletePackage(id: number) {
    try {
      await adminApi.deletePackage(id)
      toast.success('Package deleted.')
      packages.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  // ------------------------------------------------------------ AI drafting
  const [draft, setDraft] = useState<GeneratedDescriptionResponse | null>(null)
  const [draftBusy, setDraftBusy] = useState(false)

  async function generateDraft() {
    if (!serviceForm.name) {
      toast.error('Type a service name first.')
      return
    }
    setDraftBusy(true)
    try {
      const categoryName = categories.data?.find((c) => String(c.id) === serviceForm.categoryId)?.name
      setDraft(
        await aiApi.generateDescription({
          serviceName: serviceForm.name,
          categoryName,
          includedWork: serviceForm.shortDescription || undefined,
          pricingType: serviceForm.pricingType,
        }),
      )
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setDraftBusy(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'categories', label: 'Categories' },
    { key: 'services', label: 'Services' },
    { key: 'packages', label: 'Packages' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-ink-900">Catalogue</h2>
        <p className="muted mt-1">
          Add or change categories, services and packages without touching source code. Deletes are refused when data is
          still referenced, so history is never destroyed silently.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
              tab === item.key
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------- categories */}
      {tab === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {categories.loading && <Loader />}
            {categories.error && <ErrorState error={categories.error} onRetry={categories.reload} />}
            {categories.data?.map((category: CategoryResponse) => (
              <div key={category.id} className="card flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <CategoryIcon name={category.iconName} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{category.name}</p>
                  <p className="muted">
                    /{category.slug} · {category.serviceCount} service{category.serviceCount === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() =>
                    setCategoryForm({
                      id: category.id,
                      name: category.name,
                      description: category.description ?? '',
                      iconName: category.iconName ?? 'sparkles',
                      displayOrder: category.displayOrder,
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => void deleteCategory(category.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                </button>
              </div>
            ))}
          </div>

          <form className="card h-fit space-y-3 p-5" onSubmit={saveCategory}>
            <h3 className="text-sm font-semibold text-ink-900">
              {categoryForm.id ? 'Edit category' : 'New category'}
            </h3>
            <input
              className="input"
              placeholder="Name"
              value={categoryForm.name}
              onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Description"
              value={categoryForm.description}
              onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
            />
            <input
              className="input"
              placeholder="Lucide icon name (e.g. sparkles, zap, droplets)"
              value={categoryForm.iconName}
              onChange={(event) => setCategoryForm({ ...categoryForm, iconName: event.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="Display order"
              value={categoryForm.displayOrder}
              onChange={(event) => setCategoryForm({ ...categoryForm, displayOrder: Number(event.target.value) })}
            />
            <button type="submit" className="btn-primary w-full" disabled={categoryBusy}>
              <Plus className="h-4 w-4" />
              {categoryForm.id ? 'Save category' : 'Create category'}
            </button>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------- services */}
      {tab === 'services' && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {services.loading && <Loader />}
            {services.error && <ErrorState error={services.error} onRetry={services.reload} />}
            {services.data?.content.map((service) => (
              <div key={service.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                      {service.categoryName}
                    </p>
                    <p className="text-sm font-semibold text-ink-900">{service.name}</p>
                    <p className="muted">
                      {inr(service.basePrice)} · {service.pricingType} · {service.durationMinutes} min ·{' '}
                      {service.packageCount} package{service.packageCount === 1 ? '' : 's'}
                      {service.active ? '' : ' · inactive'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className="btn-ghost btn-sm" onClick={() => editService(service)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => void deleteService(service.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <form className="card space-y-3 p-5" onSubmit={saveService}>
              <h3 className="text-sm font-semibold text-ink-900">
                {serviceForm.id ? 'Edit service' : 'New service'}
              </h3>
              <input
                className="input"
                placeholder="Service name"
                value={serviceForm.name}
                onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })}
                required
              />
              <select
                className="input"
                value={serviceForm.categoryId}
                onChange={(event) => setServiceForm({ ...serviceForm, categoryId: event.target.value })}
                required
              >
                <option value="">Select category</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Short description"
                value={serviceForm.shortDescription}
                onChange={(event) => setServiceForm({ ...serviceForm, shortDescription: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="input"
                  type="number"
                  placeholder="Base price"
                  value={serviceForm.basePrice}
                  onChange={(event) => setServiceForm({ ...serviceForm, basePrice: Number(event.target.value) })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Duration (min)"
                  value={serviceForm.durationMinutes}
                  onChange={(event) => setServiceForm({ ...serviceForm, durationMinutes: Number(event.target.value) })}
                />
              </div>
              <select
                className="input"
                value={serviceForm.pricingType}
                onChange={(event) => setServiceForm({ ...serviceForm, pricingType: event.target.value as PricingType })}
              >
                {PRICING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300"
                  checked={serviceForm.featured}
                  onChange={(event) => setServiceForm({ ...serviceForm, featured: event.target.checked })}
                />
                Feature on the homepage
              </label>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={serviceBusy}>
                  {serviceForm.id ? 'Save service' : 'Create service'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => void generateDraft()} disabled={draftBusy}>
                  <Sparkles className="h-4 w-4" />
                  {draftBusy ? 'Drafting…' : 'AI draft'}
                </button>
              </div>
            </form>

            {draft && (
              <div className="card space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink-900">AI description draft</h3>
                  <span className="chip bg-amber-50 text-amber-700 ring-amber-200">Draft · needs approval</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Short</p>
                  <p className="text-sm text-ink-700">{draft.shortDescription}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Full</p>
                  <p className="text-sm text-ink-700">{draft.fullDescription}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">FAQ suggestions</p>
                  <ul className="list-inside list-disc text-sm text-ink-600">
                    {draft.faqSuggestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-ink-500">{draft.packageExplanation}</p>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setServiceForm({ ...serviceForm, description: draft.fullDescription, shortDescription: draft.shortDescription })
                    toast.success('Draft copied into the form — review it, then save.')
                  }}
                >
                  Use this draft
                </button>
                <p className="text-[11px] text-ink-400">
                  Generated in {draft.mode} mode. AI never publishes pricing or content by itself.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- packages */}
      {tab === 'packages' && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <select className="input" value={packageServiceId} onChange={(event) => setPackageServiceId(event.target.value)}>
              <option value="">Choose a service to see its packages</option>
              {(services.data?.content ?? []).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.categoryName})
                </option>
              ))}
            </select>

            {packages.loading && <Loader />}
            {packages.data && packages.data.length === 0 && <p className="muted">This service has no packages yet.</p>}
            {packages.data?.map((pkg) => (
              <div key={pkg.id} className="card flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{pkg.name}</p>
                  <p className="muted">
                    {inr(pkg.price)} · {pkg.pricingType} · {pkg.durationMinutes} min
                  </p>
                  {pkg.description && <p className="mt-1 text-xs text-ink-500">{pkg.description}</p>}
                </div>
                <button type="button" className="btn-ghost btn-sm" onClick={() => void deletePackage(pkg.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                </button>
              </div>
            ))}
          </div>

          <form className="card h-fit space-y-3 p-5" onSubmit={savePackage}>
            <h3 className="text-sm font-semibold text-ink-900">Add a package</h3>
            <input
              className="input"
              placeholder="Package name"
              value={packageForm.name}
              onChange={(event) => setPackageForm({ ...packageForm, name: event.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="input"
                type="number"
                placeholder="Price"
                value={packageForm.price}
                onChange={(event) => setPackageForm({ ...packageForm, price: Number(event.target.value) })}
              />
              <input
                className="input"
                type="number"
                placeholder="Duration (min)"
                value={packageForm.durationMinutes}
                onChange={(event) => setPackageForm({ ...packageForm, durationMinutes: Number(event.target.value) })}
              />
            </div>
            <select
              className="input"
              value={packageForm.pricingType}
              onChange={(event) => setPackageForm({ ...packageForm, pricingType: event.target.value as PricingType })}
            >
              {PRICING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <textarea
              className="input"
              rows={2}
              placeholder="Description"
              value={packageForm.description}
              onChange={(event) => setPackageForm({ ...packageForm, description: event.target.value })}
            />
            <textarea
              className="input"
              rows={2}
              placeholder="Included work"
              value={packageForm.includedWork}
              onChange={(event) => setPackageForm({ ...packageForm, includedWork: event.target.value })}
            />
            <textarea
              className="input"
              rows={2}
              placeholder="Not included"
              value={packageForm.excludedWork}
              onChange={(event) => setPackageForm({ ...packageForm, excludedWork: event.target.value })}
            />
            <button type="submit" className="btn-primary w-full" disabled={packageBusy}>
              <Plus className="h-4 w-4" />
              Create package
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
