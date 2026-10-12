import React from 'react'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import type { ToastProps } from './Toast.types'

/**
 * Toast — Molecule
 * Ephemeral alert notification with status badge and dismiss button.
 * Used in: AppShell, SettingsPanel
 */
export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'default',
  onClose,
  className = '',
}) => {
  const iconMap = {
    default: 'info' as const,
    success: 'check' as const,
    warning: 'alert' as const,
    error: 'alert' as const,
    info: 'info' as const,
  }

  const borderVariantClass = {
    default: 'border-border-default',
    success: 'border-status-success-border',
    warning: 'border-status-warning-border',
    error: 'border-status-error-border',
    info: 'border-status-info-border',
  }[variant]

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-4 rounded-lg border bg-bg-surface-1 shadow-md max-w-sm ${borderVariantClass} ${className}`.trim()}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="mt-0.5">
          <Icon name={iconMap[variant]} size="sm" />
        </span>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary break-words">{title}</span>
            <Badge variant={variant} size="sm">
              {variant.toUpperCase()}
            </Badge>
          </div>
          {description && (
            <p className="text-xs text-text-secondary leading-relaxed break-words">{description}</p>
          )}
        </div>
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Dismiss toast"
          className="!p-1 text-text-tertiary hover:text-text-primary -mr-1 -mt-1"
        >
          <Icon name="close" size="sm" />
        </Button>
      )}
    </div>
  )
}
