import React from 'react'

export interface AppShellProps {
  topbar: React.ReactNode
  leftbar?: React.ReactNode
  main: React.ReactNode
  rightbar?: React.ReactNode
  isLeftbarCollapsed?: boolean
  isRightbarOpen?: boolean
  onToggleLeftbar?: () => void
  onToggleRightbar?: () => void
  className?: string
}
