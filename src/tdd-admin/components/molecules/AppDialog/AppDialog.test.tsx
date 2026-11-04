import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AppDialog } from './AppDialog'

describe('AppDialog Molecule', () => {
  it('does not render when isOpen is false', () => {
    render(
      <AppDialog isOpen={false} onClose={() => {}} title="Test Modal">
        Content
      </AppDialog>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal dialog when isOpen is true', () => {
    render(
      <AppDialog isOpen={true} onClose={() => {}} title="Confirm Action">
        <p>Are you sure?</p>
      </AppDialog>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('calls onClose when cancel or close button is clicked', async () => {
    const handleClose = vi.fn()
    render(
      <AppDialog isOpen={true} onClose={handleClose} title="Modal">
        Body
      </AppDialog>
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(handleClose).toHaveBeenCalled()
  })
})
