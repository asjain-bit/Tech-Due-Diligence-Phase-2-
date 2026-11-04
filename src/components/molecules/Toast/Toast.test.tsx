import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Toast } from '@/components/molecules/Toast'

describe('Toast', () => {
  it('renders title, description, and badge', () => {
    render(
      <Toast
        title="Changes Saved"
        description="Your user profile has been successfully updated."
        variant="success"
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Changes Saved')).toBeInTheDocument()
    expect(screen.getByText('Your user profile has been successfully updated.')).toBeInTheDocument()
    expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  })

  it('renders close button and fires onClose when clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(<Toast title="Warning" onClose={handleClose} />)
    const closeBtn = screen.getByRole('button', { name: 'Dismiss toast' })
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders without close button if onClose not provided', () => {
    render(<Toast title="Informational" />)
    expect(screen.queryByRole('button', { name: 'Dismiss toast' })).not.toBeInTheDocument()
  })

  it('applies variant styling', () => {
    const { rerender } = render(<Toast title="Error" variant="error" />)
    expect(screen.getByRole('alert')).toHaveClass('border-status-error-border')

    rerender(<Toast title="Warning" variant="warning" />)
    expect(screen.getByRole('alert')).toHaveClass('border-status-warning-border')

    rerender(<Toast title="Info" variant="info" />)
    expect(screen.getByRole('alert')).toHaveClass('border-status-info-border')
  })
})
