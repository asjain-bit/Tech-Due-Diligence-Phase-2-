import React, { useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import type { AppDialogProps } from './AppDialog.types'

/**
 * AppDialog — Molecule
 * Modal overlay dialog for confirmations and focused interactions.
 * Used in: SettingsPanel, page
 */
export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  actions,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-bg-overlay backdrop-blur-xs transition-opacity"
        onClick={onClose}
        data-testid="dialog-backdrop"
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border-default bg-bg-modal p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="dialog-title" className="text-lg font-medium text-text-primary">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-text-secondary leading-normal">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="!p-1 text-text-tertiary hover:text-text-primary -mr-2 -mt-2"
          >
            <Icon name="close" size="sm" />
          </Button>
        </div>

        {children && <div className="text-sm text-text-primary py-2">{children}</div>}

        {actions && <div className="flex items-center justify-end gap-3 pt-2">{actions}</div>}
      </div>
    </div>
  )
}
