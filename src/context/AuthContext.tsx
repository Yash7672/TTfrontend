import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, userApi } from '../api'
import { USER_STORAGE_KEY } from '../api/client'
import type { UserResponse, UserRole } from '../types'

interface SignUpInput {
  fullName: string
  email: string
  password: string
  phone?: string
  role?: UserRole
  businessName?: string
  city?: string
}

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<UserResponse>
  signUp: (input: SignUpInput) => Promise<UserResponse>
  signOut: () => void
  refresh: () => Promise<void>
  setUser: (user: UserResponse | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserResponse) : null
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

/**
 * LOCAL DEVELOPMENT SESSION.
 *
 * There is no token: the signed-in user object (including its id) is kept in
 * localStorage and the API client sends the id as the X-User-Id header. That is
 * convenient for learning but is NOT secure authentication — the README says so.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(() => readStoredUser())
  const [loading, setLoading] = useState<boolean>(() => readStoredUser() !== null)

  const persist = useCallback((next: UserResponse | null) => {
    setUserState(next)
    if (next) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [])

  const refresh = useCallback(async () => {
    const stored = readStoredUser()
    if (!stored) {
      setLoading(false)
      return
    }
    try {
      const fresh = await userApi.me()
      persist(fresh)
    } catch {
      // The account no longer exists or the backend restarted with a fresh
      // database: drop the stale local session instead of pretending.
      persist(null)
    } finally {
      setLoading(false)
    }
  }, [persist])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password })
      persist(result.user)
      return result.user
    },
    [persist],
  )

  const signUp = useCallback(
    async (input: SignUpInput) => {
      const result = await authApi.register(input)
      // A provider account still needs an approved profile, so do not pretend the
      // user is fully set up: we store the user, and the provider pages guide them.
      persist(result.user)
      return result.user
    },
    [persist],
  )

  const signOut = useCallback(() => persist(null), [persist])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
      refresh,
      setUser: persist,
    }),
    [user, loading, signIn, signUp, signOut, refresh, persist],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
