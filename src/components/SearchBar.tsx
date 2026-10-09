import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { useCity } from '../context/CityContext'
import { CITIES } from '../utils/constants'
import { cn } from '../utils/format'

export function CitySelector({ className }: { className?: string }) {
  const { city, setCity } = useCity()
  return (
    <label className={cn('flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2', className)}>
      <MapPin className="h-4 w-4 text-brand-600" />
      <span className="sr-only">Service city</span>
      <select
        value={city}
        onChange={(event) => setCity(event.target.value)}
        className="bg-transparent text-sm font-medium text-ink-800 focus:outline-none"
      >
        {CITIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function SearchBar({
  className,
  initialValue = '',
  size = 'md',
  placeholder = 'Search for a service — AC service, tap repair, deep cleaning…',
}: {
  className?: string
  initialValue?: string
  size?: 'md' | 'lg'
  placeholder?: string
}) {
  const [value, setValue] = useState(initialValue)
  const navigate = useNavigate()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const query = value.trim()
    navigate(query ? `/search?keyword=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <form onSubmit={submit} className={cn('flex w-full items-center gap-2', className)} role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label="Search Fixora services"
          className={cn(
            'input pl-9',
            size === 'lg' && 'py-3.5 text-base shadow-card',
          )}
        />
      </div>
      <button type="submit" className={cn('btn-primary', size === 'lg' && 'px-6 py-3.5')}>
        Search
      </button>
    </form>
  )
}
