import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../utils/format'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, kind, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 6000)
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => push('success', message),
      error: (message: string) => push('error', message),
      info: (message: string) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-white p-3 shadow-card',
              toast.kind === 'success' && 'border-brand-200',
              toast.kind === 'error' && 'border-rose-200',
              toast.kind === 'info' && 'border-ink-200',
            )}
            role="status"
          >
            {toast.kind === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />}
            {toast.kind === 'error' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
            {toast.kind === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" />}
            <p className="flex-1 text-sm text-ink-800">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              className="rounded p-1 text-ink-400 hover:bg-ink-100"
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return context
}
