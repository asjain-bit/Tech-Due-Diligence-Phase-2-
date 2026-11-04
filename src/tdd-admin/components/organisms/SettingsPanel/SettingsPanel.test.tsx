import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from '@/tdd-admin/contexts/ThemeContext'
import { SettingsPanel } from './SettingsPanel'

describe('SettingsPanel Organism', () => {
  it('renders form inputs and save button', () => {
    render(
      <ThemeProvider>
        <SettingsPanel />
      </ThemeProvider>
    )
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument()
  })

  it('triggers onSave callback when form submitted', async () => {
    const handleSave = vi.fn()
    render(
      <ThemeProvider>
        <SettingsPanel onSave={handleSave} />
      </ThemeProvider>
    )
    await userEvent.click(screen.getByRole('button', { name: /save preferences/i }))
    expect(handleSave).toHaveBeenCalled()
  })
})
