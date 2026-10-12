import React from 'react'

export interface AppDialogProps {
  isOpen: boolean
  title: string
  description?: string
  onClose: () => void
  children?: React.ReactNode
  actions?: React.ReactNode
}
