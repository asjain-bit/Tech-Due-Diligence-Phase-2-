import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AppDialog } from '@/components/molecules/AppDialog'
import { Button } from '@/components/atoms/Button'

describe('AppDialog', () => {
  it('does not render when isOpen is false', () => {
    render(<AppDialog isOpen={false} title="Hidden" onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title, description, content, and actions when open', () => {
    render(
      <AppDialog
        isOpen={true}
        title="Confirm Deletion"
        description="Are you sure you want to remove this record?"
        onClose={vi.fn()}
        actions={<Button variant="destructive">Confirm</Button>}
      >
        <p>This action cannot be undone.</p>
      </AppDialog>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to remove this record?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(<AppDialog isOpen={true} title="Dialog" onClose={handleClose} />)
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' })
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn()
    const user = userEvent.setup()

    render(<AppDialog isOpen={true} title="Dialog" onClose={handleClose} />)
    const backdrop = screen.getByTestId('dialog-backdrop')
    await user.click(backdrop)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn()
    render(<AppDialog isOpen={true} title="Dialog" onClose={handleClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
