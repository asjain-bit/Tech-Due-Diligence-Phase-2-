<<<<<<< HEAD
import type React from 'react'

export interface AppShellProps {
  /** Page title shown in the sticky header (ignored when `header` is given) */
  title?: string
  /** Custom header content, e.g. breadcrumb and actions */
  header?: React.ReactNode
  /** Left nav item to highlight (matches the route segment, e.g. 'dashboard') */
  activeTab: string
  /** Remove page padding and lock to viewport height (for the canvas) */
  fullBleed?: boolean
  /** Page content */
  children?: React.ReactNode
=======
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
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
}
