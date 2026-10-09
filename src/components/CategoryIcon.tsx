import {
  Bug,
  Car,
  Droplets,
  Hammer,
  Home,
  Laptop,
  PaintRoller,
  Plug,
  Scissors,
  Sparkles,
  WandSparkles,
  WashingMachine,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Categories store a Lucide icon name in MySQL, so an administrator can change
 * the icon without a code change. Unknown names fall back to a neutral icon.
 */
const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  droplets: Droplets,
  wind: Wind,
  'washing-machine': WashingMachine,
  hammer: Hammer,
  'paint-roller': PaintRoller,
  bug: Bug,
  scissors: Scissors,
  'wand-sparkles': WandSparkles,
  plug: Plug,
  car: Car,
  laptop: Laptop,
  wrench: Wrench,
  home: Home,
}

export function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles
  return <Icon className={className} aria-hidden="true" />
}
