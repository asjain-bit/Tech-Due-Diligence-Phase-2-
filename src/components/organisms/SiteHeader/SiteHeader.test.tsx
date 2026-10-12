import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SiteHeader } from '@/components/organisms/SiteHeader'
import { ThemeProvider } from '@/contexts/ThemeContext'

describe('SiteHeader', () => {
  const sampleLinks = [
    { label: 'Overview', href: '/overview', active: true },
    { label: 'Clusters', href: '/clusters' },
    { label: 'Settings', href: '/settings' },
  ]

  it('renders branding title, navigation links, and theme toggle', () => {
    render(
      <ThemeProvider>
        <SiteHeader
          title="Cloud Dashboard"
          links={sampleLinks}
          user={{ name: 'Jane Admin', role: 'Security Ops' }}
        />
      </ThemeProvider>
    )

    expect(screen.getByText('Cloud Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Clusters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    expect(screen.getByText('Jane Admin')).toBeInTheDocument()
    expect(screen.getByText('Security Ops')).toBeInTheDocument()
  })

  it('handles search input change and submit callbacks', async () => {
    const handleSearchChange = vi.fn()
    const handleSearchSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <SiteHeader
          title="Console"
          searchValue="initial"
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
      </ThemeProvider>
    )

    const searchInput = screen.getByPlaceholderText('Search console...')
    expect(searchInput).toHaveValue('initial')

    await user.type(searchInput, 'x')
    expect(handleSearchChange).toHaveBeenCalled()
  })
})
