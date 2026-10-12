import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SettingsPanel } from '@/components/organisms/SettingsPanel'
import { ThemeProvider } from '@/contexts/ThemeContext'

describe('SettingsPanel', () => {
  it('renders all form fields and inputs', () => {
    render(
      <ThemeProvider>
        <SettingsPanel />
      </ThemeProvider>
    )

    expect(screen.getByText('Workspace Profile')).toBeInTheDocument()
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Role Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Primary Region/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notification Level/i)).toBeInTheDocument()
  })

  it('submits form with updated values for all controls', async () => {
    const handleSave = vi.fn()
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <SettingsPanel onSave={handleSave} />
      </ThemeProvider>
    )

    const usernameInput = screen.getByLabelText(/Username/i)
    await user.clear(usernameInput)
    await user.type(usernameInput, 'new.user')

    const emailInput = screen.getByLabelText(/Email Address/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new.user@test.org')

    const bioInput = screen.getByLabelText(/Role Description/i)
    await user.clear(bioInput)
    await user.type(bioInput, 'New developer bio')

    const regionSelect = screen.getByLabelText(/Primary Region/i)
    await user.selectOptions(regionSelect, 'eu-west-1')

    const notifSelect = screen.getByLabelText(/Notification Level/i)
    await user.selectOptions(notifSelect, 'critical')

    const saveBtn = screen.getByRole('button', { name: 'Save Preferences' })
    await user.click(saveBtn)

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'new.user',
        email: 'new.user@test.org',
        bio: 'New developer bio',
        region: 'eu-west-1',
        notifications: 'critical',
      })
    )
    expect(screen.getByText('Preferences saved successfully.')).toBeInTheDocument()
  })

  it('resets form when reset button is clicked', async () => {
    const handleReset = vi.fn()
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <SettingsPanel initialSettings={{ username: 'custom.mon' }} onReset={handleReset} />
      </ThemeProvider>
    )

    const resetBtn = screen.getByRole('button', { name: 'Reset' })
    await user.click(resetBtn)
    expect(handleReset).toHaveBeenCalledTimes(1)
  })
})
