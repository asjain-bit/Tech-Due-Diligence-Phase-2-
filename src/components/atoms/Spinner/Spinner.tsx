import React from 'react'
import { Loader2 } from 'lucide-react'
import type { SpinnerProps } from './Spinner.types'

const sizePixelMap = {
  sm: 16,
  md: 20,
  lg: 24,
}

/**
 * Spinner — Atom
 * Animated indicator for loading states powered by Lucide Loader2 icon.
 * Used in: Button, DataTable, SiteHeader
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 'md', label = 'Loading', className = '', ...rest }, ref) => {
    const pixelSize = sizePixelMap[size]
    const baseClasses = 'animate-spin text-action-primary-bg-default inline-block shrink-0'
    const combinedClasses = `${baseClasses} ${className}`.trim()

    return (
      <Loader2
        ref={ref}
        role="status"
        aria-label={label}
        size={pixelSize}
        strokeWidth={2}
        className={combinedClasses}
        {...rest}
      />
    )
  }
)

Spinner.displayName = 'Spinner'
