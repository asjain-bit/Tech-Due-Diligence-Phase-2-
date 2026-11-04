<<<<<<< HEAD
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/organisms/Sidebar'
import { ADMIN_PROFILE, endSession, hasSession } from '@/lib/session'
=======
import React from 'react'
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
import type { AppShellProps } from './AppShell.types'

/**
 * AppShell — Template
<<<<<<< HEAD
 * Authenticated layout: collapsible left nav, sticky page header and main content area.
 * Used in: DashboardPage, WorkflowPage, StagePage
 */
export const AppShell: React.FC<AppShellProps> = ({ title, header, activeTab, fullBleed, children }) => {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [ready, setReady] = useState(false)

  // Send anyone without an SSO session back to the login screen
  useEffect(() => {
    if (!hasSession()) {
      router.replace('/')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <div
      className={`bg-[#f8fafc] text-[#0d212c] flex font-sans antialiased ${
        fullBleed ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => router.push(`/${tab}`)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userName={ADMIN_PROFILE.name}
        userDesignation={ADMIN_PROFILE.designation}
        userAvatarUrl={ADMIN_PROFILE.avatarUrl}
        onSignOut={() => {
          endSession()
          router.replace('/')
        }}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[84px]' : 'pl-[250px]'
        }`}
      >
        <header className="w-full bg-white border-b border-[#e2e8f0] px-6 lg:px-10 py-3.5 min-h-[60px] flex items-center justify-between gap-4 sticky top-0 z-40 text-[#0d212c] shadow-xs">
          {header ?? (
            <h1 className="font-semibold text-lg lg:text-xl tracking-tight text-[#0d212c]">
              {title}
            </h1>
          )}
        </header>

        <main className={`flex-1 w-full min-h-0 ${fullBleed ? 'flex flex-col' : 'p-6'}`}>
          {children}
        </main>
=======
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
>>>>>>> 0eaebb0353032bc71bea6002cc159795d5251c2c
      </div>
    </div>
  )
}
