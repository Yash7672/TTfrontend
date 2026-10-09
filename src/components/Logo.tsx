import { Link } from 'react-router-dom'
import { cn } from '../utils/format'

/**
 * Fixora wordmark. Original design: a simple roof + spark glyph inside a teal
 * tile, drawn with SVG. No third-party brand assets are used.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="Fixora home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 14 16 6l10 8v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M12 27v-8h8v8" fill="none" stroke="#aeead7" strokeWidth="2.4" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-ink-900">Fixora</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">
            Local services
          </span>
        </span>
      )}
    </Link>
  )
}
