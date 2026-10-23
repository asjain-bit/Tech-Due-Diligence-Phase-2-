import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('shows the title, explanation and two buttons', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        title="Send for Approval?"
        description="After this you will not be able to make any edits."
        confirmLabel="Send for Approval"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByRole('dialog', { name: 'Send for Approval?' })).toBeInTheDocument()
    expect(
      screen.getByText('After this you will not be able to make any edits.')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send for Approval' }))
    expect(onConfirm).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('closes with the X and the Escape key', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        title="Delete?"
        description="Gone for good."
        confirmLabel="Delete"
        cancelLabel="Keep"
        icon={Trash2}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    )
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('renders extra details and can disable confirming', () => {
    render(
      <ConfirmDialog
        title="Change?"
        description="Check it."
        confirmLabel="Confirm change"
        confirmDisabled
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      >
        <p>Extra details</p>
      </ConfirmDialog>
    )
    expect(screen.getByText('Extra details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm change' })).toBeDisabled()
  })

  it('can show a single button, while closing still reports onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        title="Ready"
        description="d"
        confirmLabel="Proceed"
        hideCancel
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
