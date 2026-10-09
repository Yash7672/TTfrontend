import { useCallback, useEffect, useState } from 'react'
import { toApiError } from '../api/client'
import type { ApiError } from '../types'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  reload: () => void
  setData: (value: T | null) => void
}

/**
 * Small data-loading hook: runs `loader` on mount and whenever `deps` change,
 * and exposes loading/error state so every page can render an honest empty or
 * error state instead of a blank screen.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loader()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(toApiError(caught))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // Intentionally keyed on the caller-provided deps plus the manual reload key.
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, loading, error, reload, setData }
}
