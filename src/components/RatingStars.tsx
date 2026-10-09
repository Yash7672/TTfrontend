import { Star } from 'lucide-react'
import { cn } from '../utils/format'

interface RatingStarsProps {
  average: number
  count: number
  size?: 'sm' | 'md'
  showCount?: boolean
}

/**
 * Shows a real rating only. With zero reviews it prints "No reviews yet" instead
 * of fabricating a score.
 */
export function RatingStars({ average, count, size = 'sm', showCount = true }: RatingStarsProps) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  if (!count) {
    return <span className="text-xs font-medium text-ink-400">No reviews yet</span>
  }

  const rounded = Math.round(average)

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={cn(iconClass, value <= rounded ? 'fill-amber-400 text-amber-400' : 'text-ink-300')}
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-ink-700">{average.toFixed(1)}</span>
      {showCount && (
        <span className="text-xs text-ink-500">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      )}
    </span>
  )
}
