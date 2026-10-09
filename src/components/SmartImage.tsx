import { useState, type ReactNode } from 'react'
import { cn } from '../utils/format'

const GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-sky-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-600',
]

function gradientFor(seed: string): string {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973
  }
  return GRADIENTS[hash % GRADIENTS.length]
}

interface SmartImageProps {
  src?: string
  alt: string
  seed: string
  className?: string
  children?: ReactNode
}

/**
 * Renders a service/category image, and if the URL is missing OR fails to load
 * falls back to a deterministic per-item gradient with the category icon on top.
 * The storefront therefore never shows a broken image, and never reuses one
 * identical picture for everything.
 */
export function SmartImage({ src, alt, seed, className, children }: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  if (showFallback) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-gradient-to-br',
          gradientFor(seed),
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="opacity-90">{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-ink-100', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
