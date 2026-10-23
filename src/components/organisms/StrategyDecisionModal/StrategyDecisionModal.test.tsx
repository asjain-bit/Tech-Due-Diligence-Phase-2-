import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StrategyDecisionModal } from './StrategyDecisionModal'

describe('StrategyDecisionModal', () => {
  it('proceeds with or without a reason', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<StrategyDecisionModal mode="proceed" onConfirm={onConfirm} onClose={vi.fn()} />)
    expect(screen.getByText('(optional)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })

  it('needs a reason to reject', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<StrategyDecisionModal mode="reject" onConfirm={onConfirm} onClose={vi.fn()} />)
    const reject = screen.getByRole('button', { name: 'Reject partnership' })
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), '   ')
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), 'No UAE hosting')
    await user.click(reject)
    expect(onConfirm).toHaveBeenCalledWith('No UAE hosting')
  })

  it('closes from the X, Cancel and Escape, and scrolls inside', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<StrategyDecisionModal mode="proceed" onConfirm={vi.fn()} onClose={onClose} />)
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    await user.click(screen.getByRole('button', { name: 'Close decision' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
