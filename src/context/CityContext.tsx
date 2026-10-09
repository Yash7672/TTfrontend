import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_CITY } from '../utils/constants'

const CITY_STORAGE_KEY = 'fixora.city'

interface CityContextValue {
  city: string
  setCity: (city: string) => void
}

const CityContext = createContext<CityContextValue | undefined>(undefined)

/** The selected service city. Provider search uses it as a real query parameter. */
export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<string>(() => {
    const stored = localStorage.getItem(CITY_STORAGE_KEY)
    return stored && stored.trim() ? stored : DEFAULT_CITY
  })

  const setCity = useCallback((next: string) => {
    setCityState(next)
    localStorage.setItem(CITY_STORAGE_KEY, next)
  }, [])

  const value = useMemo(() => ({ city, setCity }), [city, setCity])

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity(): CityContextValue {
  const context = useContext(CityContext)
  if (!context) {
    throw new Error('useCity must be used inside <CityProvider>')
  }
  return context
}
