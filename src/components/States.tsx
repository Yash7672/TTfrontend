import { AlertTriangle, Loader2, PackageOpen, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../utils/format'
import type { ApiError } from '../types'

export function Loader({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-10 text-sm text-ink-500', className)} role="status">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card animate-pulse overflow-hidden">
          <div className="h-40 bg-ink-100" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-ink-100" />
            <div className="h-3 w-1/2 rounded bg-ink-100" />
            <div className="h-8 w-28 rounded bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-500">
        {icon ?? <PackageOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-start gap-3 border-rose-200 px-6 py-8">
      <div className="flex items-center gap-2 text-rose-700">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="text-base font-semibold">{error.error || 'Something went wrong'}</h3>
      </div>
      <p className="text-sm text-ink-600">{error.message}</p>
      {error.fieldErrors && (
        <ul className="list-inside list-disc text-xs text-ink-500">
          {Object.entries(error.fieldErrors).map(([field, message]) => (
            <li key={field}>
              <span className="font-medium">{field}</span>: {message}
            </li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" className="btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  )
}

export function InlineError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="field-error">{message}</p>
}
