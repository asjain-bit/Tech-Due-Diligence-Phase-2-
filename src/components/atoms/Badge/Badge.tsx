import React from 'react'
import type { BadgeProps } from './Badge.types'

/**
 * Badge — Atom
 * Compact status label or tag indicator.
 * Used in: KPICard, DataTable, Toast
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...rest }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors'

    const variantClasses = {
      default: 'bg-bg-surface-2 text-text-secondary border border-border-subtle',
      success: 'bg-status-success-bg text-status-success-text border border-status-success-border',
      warning: 'bg-status-warning-bg text-status-warning-text border border-status-warning-border',
      error: 'bg-status-error-bg text-status-error-text border border-status-error-border',
      info: 'bg-status-info-bg text-status-info-text border border-status-info-border',
    }[variant]

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    }[size]

    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()

    return (
      <span ref={ref} className={combinedClasses} {...rest}>
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
