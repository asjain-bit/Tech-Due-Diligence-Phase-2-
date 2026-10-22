import type { ComponentType, ReactNode } from 'react'

export interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Lucide icon shown in the rounded square at the top */
  icon?: ComponentType<{ className?: string }>
  /** Extra details between the description and the buttons */
  children?: ReactNode
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}
