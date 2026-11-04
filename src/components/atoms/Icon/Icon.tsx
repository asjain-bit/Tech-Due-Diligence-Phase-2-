import React from 'react'
import {
  Search,
  Sun,
  Moon,
  Laptop,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle,
  Info,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { IconProps, IconName } from './Icon.types'

const iconMap: Record<IconName, LucideIcon> = {
  search: Search,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  close: X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  check: Check,
  alert: AlertCircle,
  info: Info,
  settings: Settings,
}

const sizePixelMap = {
  sm: 16,
  md: 20,
  lg: 24,
}

/**
 * Icon — Atom
 * Semantic scalable vector icon powered exclusively by Lucide Icons.
 * Used in: SearchBar, Toast, AppDialog, SiteHeader, DataTable, KPICard, SettingsPanel
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', label, className = '', ...rest }, ref) => {
    const Component = iconMap[name] ?? Info
    const pixelSize = sizePixelMap[size]

    return (
      <Component
        ref={ref}
        size={pixelSize}
        strokeWidth={2}
        role="img"
        aria-label={label || name}
        className={`inline-block shrink-0 ${className}`.trim()}
        {...rest}
      />
    )
  }
)

Icon.displayName = 'Icon'
