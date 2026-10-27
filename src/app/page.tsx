'use client'

import React, { useState } from 'react'
import { LoginScreen, AVAILABLE_PROFILES, type UserProfile } from '@/components/screens/LoginScreen'
import { UsageInsightsScreen } from '@/components/screens/UsageInsightsScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { VendorWebForm } from '@/components/screens/VendorWebForm'
import { Sidebar } from '@/components/organisms/Sidebar'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'
import { buildCaseFromForm, nextCaseCode } from '@/lib/caseActions'
import { DEFAULT_ASSUMPTIONS, type UsageAssumptions } from '@/lib/usageInsights'
import type { VendorFormValues } from '@/types/vendorForm'

export default function HomePage() {
  // Land on SSO login screen first
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'usage'>('dashboard')
  // Default designation is Director as requested
  const [userProfile, setUserProfile] = useState<UserProfile>(
    AVAILABLE_PROFILES.find((p) => p.id === 'director') ?? AVAILABLE_PROFILES[0]
  )
  // Cases are shared by every profile for the length of the session
  const [requests, setRequests] = useState<PartnershipRequest[]>(INITIAL_PARTNERSHIP_REQUESTS)
  // The Value/ROI inputs the Partnership Admin last recalculated, shown to every profile
  const [usageAssumptions, setUsageAssumptions] = useState<UsageAssumptions>(DEFAULT_ASSUMPTIONS)
  const [recalculatedAt, setRecalculatedAt] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile)
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
  }

  const handleVendorSubmit = (values: VendorFormValues) => {
    const code = nextCaseCode(requests)
    setRequests((prev) => [buildCaseFromForm(values, code), ...prev])
    return code
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (userProfile.id === 'vendor') {
    return <VendorWebForm onSubmitCase={handleVendorSubmit} onSignOut={handleSignOut} />
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] flex font-sans antialiased">
      {/* Expandable/Collapsible Left Navigation Sidebar — Dashboard and Usage Insights */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'dashboard' | 'usage')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userName={userProfile.name}
        userDesignation={userProfile.designation}
        userAvatarUrl={userProfile.avatarUrl}
        onSignOut={handleSignOut}
      />

      {/* Main Body Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[84px]' : 'pl-[250px]'
        }`}
      >
        {/* Top Header Bar — Compact, no subheading, no theme toggle */}
        <header className="w-full bg-white border-b border-[#e2e8f0] px-6 lg:px-10 py-3.5 flex items-center justify-between sticky top-0 z-40 text-[#0d212c] shadow-xs">
          <h1 className="font-semibold text-lg lg:text-xl tracking-tight text-[#0d212c]">
            {activeTab === 'usage' ? 'Usage' : 'Dashboard'}
          </h1>
        </header>

        {/* Full-Width Dashboard Content */}
        <main className="flex-1 w-full p-6">
          {activeTab === 'usage' ? (
            <UsageInsightsScreen
              requests={requests}
              canRecalculate={userProfile.id === 'partnership-admin'}
              assumptions={usageAssumptions}
              recalculatedAt={recalculatedAt}
              onRecalculate={(next) => {
                setUsageAssumptions(next)
                setRecalculatedAt(new Date().toLocaleString('en-GB'))
              }}
            />
          ) : (
            <DashboardScreen
              userProfile={userProfile}
              requests={requests}
              onRequestsChange={setRequests}
            />
          )}
        </main>
      </div>
    </div>
  )
}
