import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell Template', () => {
  it('renders topbar, main, leftbar, and rightbar slots', () => {
    render(
      <AppShell
        topbar={<div>Header Content</div>}
        leftbar={<div>Navigation Links</div>}
        main={<div>Main Application View</div>}
        rightbar={<div>Sidebar Details</div>}
      />
    )
    expect(screen.getByText('Header Content')).toBeInTheDocument()
    expect(screen.getByText('Navigation Links')).toBeInTheDocument()
    expect(screen.getByText('Main Application View')).toBeInTheDocument()
    expect(screen.getByText('Sidebar Details')).toBeInTheDocument()
  })
})
