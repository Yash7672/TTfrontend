import { cn, STATUS_LABELS, titleCase } from '../utils/format'
import type { BookingStatus, ProviderStatus } from '../types'

const BOOKING_CLASSES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  ACCEPTED: 'bg-sky-50 text-sky-700 ring-sky-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  COMPLETED: 'bg-brand-50 text-brand-700 ring-brand-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  CANCELLED: 'bg-ink-100 text-ink-600 ring-ink-200',
}

const PROVIDER_CLASSES: Record<ProviderStatus, string> = {
  APPROVED: 'bg-brand-50 text-brand-700 ring-brand-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-200',
  SUSPENDED: 'bg-ink-100 text-ink-600 ring-ink-200',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={cn('chip', BOOKING_CLASSES[status] ?? 'bg-ink-100 text-ink-600 ring-ink-200')}>{STATUS_LABELS[status] ?? status}</span>
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  return <span className={cn('chip', PROVIDER_CLASSES[status] ?? 'bg-ink-100 text-ink-600 ring-ink-200')}>{titleCase(status)}</span>
}

export function NeutralBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'brand' | 'warn' | 'danger' }) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    warn: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return <span className={cn('chip', tones[tone])}>{children}</span>
}
