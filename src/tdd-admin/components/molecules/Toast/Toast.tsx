/**
 * Toast — Molecule
 * Alert notification banner combining Icon, text, and close Button atoms.
 * Used in: SettingsPanel, AppShell
 */

import React from 'react'
import { Icon, IconName } from '@/tdd-admin/components/atoms/Icon'
import { Button } from '@/tdd-admin/components/atoms/Button'
import { ToastProps } from './Toast.types'

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  onDismiss,
  className = '',
}) => {
  const iconMap: Record<NonNullable<ToastProps['type']>, IconName> = {
    success: 'check',
    warning: 'bell',
    error: 'x',
    info: 'bell',
  }

  const containerStyles: Record<NonNullable<ToastProps['type']>, string> = {
    success: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]',
    warning: 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]',
    error: 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]',
    info: 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]',
  }

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 p-4 rounded-lg border shadow-sm transition-all w-full max-w-md',
        containerStyles[type],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon name={iconMap[type]} size={20} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{title}</h4>
        {description && <p className="text-xs opacity-90 mt-0.5">{description}</p>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="h-6 w-6 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
        >
          <Icon name="x" size={14} />
        </Button>
      )}
    </div>
  )
}
