/**
 * Tiny time-to-live cache with in-flight de-duplication for read-only, non-user
 * specific API calls (the public catalogue: categories, featured/popular services).
 *
 * - A cached value is returned until its TTL expires.
 * - Concurrent callers asking for the same key share one network request.
 * - Only ever point this at public, non-personalised data. Never use it for
 *   /users/me, bookings, notifications, addresses or anything user-specific.
 */
interface CacheEntry {
  value: unknown
  expires: number
}

const store = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<unknown>>()

export function cachedRequest<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const hit = store.get(key)
  if (hit && hit.expires > now) {
    return Promise.resolve(hit.value as T)
  }

  const pending = inFlight.get(key)
  if (pending) {
    return pending as Promise<T>
  }

  const request = loader()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs })
      return value
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, request)
  return request
}

/** Drops cached entries. With no prefix, clears everything. */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    store.clear()
    return
  }
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }
}
