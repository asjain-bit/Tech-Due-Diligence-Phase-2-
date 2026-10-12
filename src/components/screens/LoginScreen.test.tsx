import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LoginScreen, AVAILABLE_PROFILES } from './LoginScreen'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('LoginScreen', () => {
  it('renders SSO welcome view with Tech Due Diligence branding', () => {
    renderWithTheme(<LoginScreen onLogin={vi.fn()} />)
    expect(screen.getByText('Tech Due Diligence')).toBeInTheDocument()
    expect(screen.getByText('Sign in with SSO')).toBeInTheDocument()
    expect(screen.getByText('Sign in with your organisational account')).toBeInTheDocument()
  })

  it('transitions to profile selection view when clicking Sign in with SSO', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginScreen onLogin={vi.fn()} />)

    await user.click(screen.getByText('Sign in with SSO'))
    expect(screen.getByText('Select Profile')).toBeInTheDocument()

    // Assert all 5 profiles are listed
    expect(screen.getByText('Director')).toBeInTheDocument()
    expect(screen.getByText('Evaluator')).toBeInTheDocument()
    expect(screen.getByText('Stragety Fit')).toBeInTheDocument()
    expect(screen.getByText('Sponsor')).toBeInTheDocument()
    expect(screen.getByText('Legal & Partnership Director')).toBeInTheDocument()
  })

  it('allows navigating back to welcome screen', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginScreen onLogin={vi.fn()} />)

    await user.click(screen.getByText('Sign in with SSO'))
    expect(screen.getByText('Select Profile')).toBeInTheDocument()

    await user.click(screen.getByText('Back to sign in'))
    expect(screen.getByText('Sign in with SSO')).toBeInTheDocument()
  })

  it('selects Director profile and triggers onLogin', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const handleLogin = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    renderWithTheme(<LoginScreen onLogin={handleLogin} />)

    await user.click(screen.getByText('Sign in with SSO'))
    await user.click(screen.getByText('Director'))

    expect(screen.getByText('Setting up your workspace...')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(handleLogin).toHaveBeenCalledWith(AVAILABLE_PROFILES[0])
    vi.useRealTimers()
  })

  it('selects other role profiles and triggers onLogin', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const handleLogin = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    renderWithTheme(<LoginScreen onLogin={handleLogin} />)

    await user.click(screen.getByText('Sign in with SSO'))
    await user.click(screen.getByText('Legal & Partnership Director'))

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(handleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ roleTitle: 'Legal & Partnership Director' })
    )
    vi.useRealTimers()
  })

  it('renders all profile icon branches correctly', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginScreen onLogin={vi.fn()} />)

    await user.click(screen.getByText('Sign in with SSO'))
    AVAILABLE_PROFILES.forEach((p) => {
      expect(screen.getByText(p.roleTitle)).toBeInTheDocument()
    })
  })
})
