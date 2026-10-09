import type { BookingStatus, PricingType } from '../types'

/** Indian rupee formatting. All Fixora prices are demo prices in INR. */
export function inr(value?: number | null): string {
  if (value === null || value === undefined) return '—'
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function duration(minutes?: number | null): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

/** "2026-10-15" -> "Thu, 15 Oct 2026" without pulling in a date library. */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "14:30:00" -> "2:30 PM" */
export function formatTime(value?: string | null): string {
  if (!value) return '—'
  const [hRaw, mRaw] = value.split(':')
  const hours = Number(hRaw)
  const minutes = Number(mRaw ?? 0)
  if (Number.isNaN(hours)) return value
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return `${display}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function addDaysIso(days: number): string {
  const now = new Date()
  now.setDate(now.getDate() + days)
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

/** Human sentence for a pricing model, used next to every price. */
export function pricingLabel(pricingType?: PricingType): string {
  switch (pricingType) {
    case 'FIXED_PRICE':
      return 'Fixed price'
    case 'STARTING_PRICE':
      return 'Starting from'
    case 'INSPECTION_FEE':
      return 'Inspection fee only'
    case 'QUOTATION':
      return 'Quoted after inspection'
    default:
      return ''
  }
}

export function pricingNote(pricingType?: PricingType): string {
  switch (pricingType) {
    case 'INSPECTION_FEE':
      return 'Covers the visit and inspection only. Repair work is billed separately and is confirmed with you first.'
    case 'QUOTATION':
      return 'The final price is confirmed by the provider after inspecting the site.'
    case 'STARTING_PRICE':
      return 'Starting price. The provider confirms the final amount before work begins.'
    case 'FIXED_PRICE':
      return 'Fixed price for the scope described in the package.'
    default:
      return ''
  }
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function statusClasses(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'ACCEPTED':
      return 'bg-sky-50 text-sky-700 ring-sky-200'
    case 'IN_PROGRESS':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
    case 'COMPLETED':
      return 'bg-brand-50 text-brand-700 ring-brand-200'
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    case 'CANCELLED':
      return 'bg-ink-100 text-ink-600 ring-ink-200'
    default:
      return 'bg-ink-100 text-ink-600 ring-ink-200'
  }
}

export function titleCase(value?: string | null): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Tiny classnames helper so we do not need another dependency. */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ')
}

export function initials(name?: string): string {
  if (!name) return 'F'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
