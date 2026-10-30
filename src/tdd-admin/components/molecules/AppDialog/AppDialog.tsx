/**
 * AppDialog — Molecule
 * Modal dialog overlay combining title header, action Button atoms, and icon close button.
 * Used in: SettingsPanel, DataTable
 */

import React from 'react'
import { Button } from '@/tdd-admin/components/atoms/Button'
import { Icon } from '@/tdd-admin/components/atoms/Icon'
import { AppDialogProps } from './AppDialog.types'

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmLabel = 'Confirm',
  onConfirm,
  destructive = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg-overlay backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative z-10 w-full max-w-lg bg-bg-modal rounded-xl border border-border-default shadow-xl overflow-hidden p-6 flex flex-col gap-4 text-text-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <h3 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 p-0"
          >
            <Icon name="x" size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="text-sm py-2">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {onConfirm && (
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
