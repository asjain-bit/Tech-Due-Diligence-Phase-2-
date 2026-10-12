'use client'

import React, { useState } from 'react'
import { LoginScreen, AVAILABLE_PROFILES, type UserProfile } from '@/components/screens/LoginScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { Sidebar } from '@/components/organisms/Sidebar'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'

export default function HomePage() {
  // Land on SSO login screen first
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard'>('dashboard')
  // Default designation is Director as requested
  const [userProfile, setUserProfile] = useState<UserProfile>(AVAILABLE_PROFILES[0])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile)
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d212c] flex font-sans antialiased">
      {/* Expandable/Collapsible Left Navigation Sidebar — Dashboard only */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'dashboard')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userName={userProfile.name}
        userEmail={userProfile.email}
        userDesignation={userProfile.designation}
        userAvatarUrl={userProfile.avatarUrl}
        onSignOut={handleSignOut}
      />

      {/* Main Body Layout Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[250px]'
        }`}
      >
        {/* Top Header Bar */}
        <header className="w-full bg-white border-b border-[#e2e8f0] px-6 lg:px-10 py-5 flex items-center justify-between sticky top-0 z-40 text-[#0d212c] shadow-xs">
          <div className="flex flex-col">
            <h1 className="font-extrabold text-xl lg:text-2xl tracking-tight text-[#0d212c]">
              Dashboard
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5 leading-normal">
              Viewing workspace as{' '}
              <span className="font-bold text-[#0d212c]">{userProfile.roleTitle}</span> (
              <span className="font-semibold text-[#36c0c9]">{userProfile.designation}</span>)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
          </div>
        </header>

        {/* Full-Width Dashboard Content */}
        <main className="flex-1 w-full">
          <DashboardScreen />
        </main>
      </div>
    </div>
  )
}
