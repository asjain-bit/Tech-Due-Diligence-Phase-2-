import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Toast } from './Toast'

describe('Toast Molecule', () => {
  it('renders title and description', () => {
    render(<Toast title="Settings saved" description="Your changes are active." type="success" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Settings saved')).toBeInTheDocument()
    expect(screen.getByText('Your changes are active.')).toBeInTheDocument()
  })

  it('calls onDismiss when close button clicked', async () => {
    const handleDismiss = vi.fn()
    render(<Toast title="Notification" onDismiss={handleDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: /dismiss toast/i }))
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })
})
