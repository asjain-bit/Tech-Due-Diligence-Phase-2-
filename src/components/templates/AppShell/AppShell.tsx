import React from 'react'
import type { AppShellProps } from './AppShell.types'

/**
 * AppShell — Template
 * Application layout skeleton with topbar, collapsible leftbar, main area, and collapsible rightbar.
 * Used in: page
 */
export const AppShell: React.FC<AppShellProps> = ({
  topbar,
  leftbar,
  main,
  rightbar,
  isLeftbarCollapsed = false,
  isRightbarOpen = false,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col bg-bg-default text-text-primary ${className}`.trim()}
    >
      {/* Topbar slot: 56px */}
      <div className="h-[56px] w-full shrink-0 z-30">{topbar}</div>

      {/* Main body: leftbar + main + rightbar */}
      <div className="flex flex-1 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* Leftbar slot (optional, 165px / 48px collapsed) */}
        {leftbar && (
          <aside
            aria-label="Sidebar navigation"
            data-testid="appshell-leftbar"
            data-collapsed={isLeftbarCollapsed ? 'true' : 'false'}
            className={`shrink-0 border-r border-border-default bg-bg-sidebar transition-[width] duration-200 overflow-y-auto ${
              isLeftbarCollapsed ? 'w-[48px]' : 'w-[165px]'
            }`}
          >
            {leftbar}
          </aside>
        )}

        {/* Main slot: flex-grow */}
        <main
          data-testid="appshell-main"
          className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-default"
        >
          {main}
        </main>

        {/* Rightbar slot (optional, ~280px, hide/show) */}
        {rightbar && isRightbarOpen && (
          <aside
            aria-label="Side panel"
            data-testid="appshell-rightbar"
            className="w-[280px] shrink-0 border-l border-border-default bg-bg-surface-1 transition-all duration-200 overflow-y-auto"
          >
            {rightbar}
          </aside>
        )}
      </div>
    </div>
  )
}
