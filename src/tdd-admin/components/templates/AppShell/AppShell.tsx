/**
 * AppShell — Template
 * Main structural skeleton defining topbar, leftbar, main content, and rightbar layout slots.
 * Used in: app/page.tsx
 */

import React from 'react'
import { AppShellProps } from './AppShell.types'

export const AppShell: React.FC<AppShellProps> = ({
  topbar,
  leftbar,
  main,
  rightbar,
  isLeftbarCollapsed = false,
  isRightbarOpen = true,
  className = '',
}) => {
  return (
    <div className={['min-h-screen flex flex-col bg-bg-default text-text-primary', className].filter(Boolean).join(' ')}>
      {/* Topbar slot (56px) */}
      {topbar && <div className="w-full shrink-0 z-30">{topbar}</div>}

      {/* Main content row */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Leftbar slot (165px / 48px collapsed) */}
        {leftbar && (
          <aside
            className={[
              'shrink-0 bg-bg-sidebar border-r border-border-default transition-all duration-200 overflow-y-auto',
              isLeftbarCollapsed ? 'w-[48px]' : 'w-[165px]',
            ].join(' ')}
          >
            {leftbar}
          </aside>
        )}

        {/* Main slot (flex-grow) */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-default">{main}</main>

        {/* Rightbar slot (~280px hide/show) */}
        {rightbar && isRightbarOpen && (
          <aside className="w-[280px] shrink-0 bg-bg-surface-1 border-l border-border-default p-4 overflow-y-auto hidden lg:block">
            {rightbar}
          </aside>
        )}
      </div>
    </div>
  )
}
