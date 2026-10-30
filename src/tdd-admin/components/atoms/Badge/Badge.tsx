/**
 * Badge — Atom
 * Small status or numeric indicator badge.
 * Used in: KPICard, Toast, DataTable, SettingsPanel
 */

import React from 'react'
import { BadgeProps } from './Badge.types'

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', className = '', children, ...props }) => {
  const baseStyle =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors'

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    neutral: 'bg-bg-surface-2 text-text-primary border-border-default',
    success: 'bg-status-success-bg text-status-success-text border-status-success-border',
    warning: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
    error: 'bg-status-error-bg text-status-error-text border-status-error-border',
    info: 'bg-status-info-bg text-status-info-text border-status-info-border',
  }

  const combinedClassName = [baseStyle, variantStyles[variant], className].filter(Boolean).join(' ')

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  )
}
