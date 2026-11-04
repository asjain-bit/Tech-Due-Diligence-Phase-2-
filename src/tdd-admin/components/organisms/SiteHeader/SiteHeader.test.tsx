import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/tdd-admin/contexts/ThemeContext'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader Organism', () => {
  it('renders brand title and subtitle', () => {
    render(
      <ThemeProvider>
        <SiteHeader title="Test App" subtitle="Test Subtitle" />
      </ThemeProvider>
    )
    expect(screen.getByText('Test App')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })
})
