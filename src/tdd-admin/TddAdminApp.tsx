/**
 * TddAdminApp — Template
 * TDD Admin profile view: the M42 Tech Due Diligence admin app (Dashboard, Questionnaires, Vendors, Agents, Usage Insights), entered from the shared login.
 * Used in: HomePage
 */

'use client'

import React, { useState } from 'react'
import { DashboardScreen } from '@/tdd-admin/components/screens/DashboardScreen'
import { QuestionnairesScreen } from '@/tdd-admin/components/screens/QuestionnairesScreen'
import { VendorsScreen } from '@/tdd-admin/components/screens/VendorsScreen'
import { AgentsScreen } from '@/tdd-admin/components/screens/AgentsScreen'
import { UsageInsightsScreen } from '@/tdd-admin/components/screens/UsageInsightsScreen'
import { Sidebar } from '@/tdd-admin/components/organisms/Sidebar'
import { SiteHeader } from '@/tdd-admin/components/organisms/SiteHeader'
import { PageSkeletonLoader } from '@/tdd-admin/components/molecules/PageSkeletonLoader'
import './tdd-admin.css'

type TddAdminTab = 'dashboard' | 'questionnaires' | 'vendors' | 'agents' | 'usage-insights'

const PAGE_TITLES: Record<TddAdminTab, string> = {
  dashboard: 'Dashboard',
  questionnaires: 'Questionnaires',
  vendors: 'Vendors',
  agents: 'Agents',
  'usage-insights': 'Usage Insights',
}

interface TddAdminAppProps {
  userName: string
  userEmail: string
  onSignOut: () => void
}

export const TddAdminApp: React.FC<TddAdminAppProps> = ({ userName, userEmail, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<TddAdminTab>('dashboard')
  const [isPageLoading, setIsPageLoading] = useState(false)
  // Expandable/Collapsible Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleTabChange = (tab: TddAdminTab) => {
    if (tab === activeTab && !isPageLoading) return
    setIsPageLoading(true)
    setActiveTab(tab)
    setTimeout(() => {
      setIsPageLoading(false)
    }, 1000)
  }

  return (
    <div className="tdd-admin min-h-screen bg-[#f8fafc] text-[#0d212c] flex font-sans antialiased">
      {/* Expandable/Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as TddAdminTab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userName={userName}
        userEmail={userEmail}
        onSignOut={onSignOut}
      />

      {/* Right Main Body Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[250px]'
        }`}
      >
        {/* Top Header Bar */}
        <SiteHeader title={PAGE_TITLES[activeTab]} subtitle="" />

        {/* Main Full-Width Content Area */}
        <main className="flex-1 w-full">
          {isPageLoading ? (
            <PageSkeletonLoader />
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardScreen />}
              {activeTab === 'questionnaires' && <QuestionnairesScreen />}
              {activeTab === 'vendors' && <VendorsScreen />}
              {activeTab === 'agents' && <AgentsScreen />}
              {activeTab === 'usage-insights' && <UsageInsightsScreen />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
