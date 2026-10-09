import axios from 'axios'
import type { ApiError } from '../types'

export const USER_STORAGE_KEY = 'fixora.user'

/**
 * Every request goes to a RELATIVE /api path.
 *
 * In Docker, Nginx serves this app and proxies /api/ to the backend container, so
 * the browser never needs to resolve a Docker-internal hostname and there is no
 * cross-origin problem. In `npm run dev`, Vite proxies /api to localhost:8080.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

/**
 * LOCAL DEVELOPMENT AUTHENTICATION ONLY.
 *
 * Fixora has no Spring Security / JWT yet. The signed-in user id travels in the
 * X-User-Id header because there is no session or token. This is NOT a security
 * boundary: any client can set the header. The README documents this limitation.
 */
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { id?: number }
      if (parsed?.id) {
        ;(config.headers as Record<string, string>)['X-User-Id'] = String(parsed.id)
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }
  return config
})

/** Normalises anything axios throws into the backend's ErrorResponse shape. */
export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined
    if (data && typeof data === 'object' && 'message' in data) {
      return {
        status: data.status ?? error.response?.status ?? 500,
        error: data.error ?? 'Error',
        message: data.message ?? 'Something went wrong.',
        timestamp: data.timestamp,
        path: data.path,
        fieldErrors: data.fieldErrors,
      }
    }
    if (!error.response) {
      return {
        status: 0,
        error: 'Network error',
        message:
          'The Fixora API could not be reached. Check that the backend container is running (docker compose ps).',
      }
    }
    return {
      status: error.response.status,
      error: error.response.statusText || 'Error',
      message: `Request failed with status ${error.response.status}.`,
    }
  }
  return {
    status: 500,
    error: 'Error',
    message: error instanceof Error ? error.message : 'Unexpected error.',
  }
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message
}
