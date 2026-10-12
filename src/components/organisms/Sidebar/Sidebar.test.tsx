import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './Sidebar'

describe('Sidebar', () => {
  it('renders navigation item Dashboard and user designation Director', () => {
    render(
      <Sidebar
        activeTab="dashboard"
        onTabChange={vi.fn()}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        userName="Zaid Al Ali"
        userDesignation="Director"
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Zaid Al Ali')).toBeInTheDocument()
    expect(screen.getByText('Director')).toBeInTheDocument()
  })

  it('calls onTabChange when tab is clicked', async () => {
    const handleTabChange = vi.fn()
    const user = userEvent.setup()

    render(
      <Sidebar
        activeTab=""
        onTabChange={handleTabChange}
        collapsed={false}
        onToggleCollapse={vi.fn()}
      />
    )

    await user.click(screen.getByText('Dashboard'))
    expect(handleTabChange).toHaveBeenCalledWith('dashboard')
  })

  it('opens and cancels logout modal', async () => {
    const handleSignOut = vi.fn()
    const user = userEvent.setup()

    render(
      <Sidebar
        activeTab="dashboard"
        onTabChange={vi.fn()}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onSignOut={handleSignOut}
      />
    )

    await user.click(screen.getByTitle('Sign out'))
    expect(screen.getByText('Confirm Logout')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Confirm Logout')).not.toBeInTheDocument()
  })

  it('triggers onSignOut on confirm logout', async () => {
    const handleSignOut = vi.fn()
    const user = userEvent.setup()

    render(
      <Sidebar
        activeTab="dashboard"
        onTabChange={vi.fn()}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        onSignOut={handleSignOut}
      />
    )

    await user.click(screen.getByTitle('Sign out'))
    await user.click(screen.getByRole('button', { name: 'Logout' }))
    expect(handleSignOut).toHaveBeenCalled()
  })

  it('handles collapsed state and triggers toggle collapse', async () => {
    const handleToggle = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <Sidebar
        activeTab="dashboard"
        onTabChange={vi.fn()}
        collapsed={false}
        onToggleCollapse={handleToggle}
      />
    )

    await user.click(screen.getByTitle('Collapse sidebar'))
    expect(handleToggle).toHaveBeenCalled()

    rerender(
      <Sidebar
        activeTab="dashboard"
        onTabChange={vi.fn()}
        collapsed={true}
        onToggleCollapse={handleToggle}
      />
    )

    await user.click(screen.getByTitle('Expand sidebar'))
    expect(handleToggle).toHaveBeenCalledTimes(2)

    await user.click(screen.getByTitle('Sign out'))
    expect(screen.getByText('Confirm Logout')).toBeInTheDocument()
  })
})
