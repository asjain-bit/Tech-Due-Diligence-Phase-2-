import React from 'react'

export interface AppDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  confirmLabel?: string
  onConfirm?: () => void
  destructive?: boolean
}
