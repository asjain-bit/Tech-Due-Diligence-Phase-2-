import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BriefDecisionModal } from './BriefDecisionModal'

describe('BriefDecisionModal', () => {
  it('approves with an optional reason', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BriefDecisionModal initialChoice="approve" onSubmit={onSubmit} onClose={vi.fn()} />)
    expect(
      screen.getByRole('radio', { name: /Approve for internal review/, checked: true })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reason (optional)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onSubmit).toHaveBeenCalledWith('approve', '')
  })

  it('needs a reason to reject', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BriefDecisionModal initialChoice="reject" onSubmit={onSubmit} onClose={vi.fn()} />)
    const reject = screen.getByRole('button', { name: 'Reject request' })
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), 'Duplicate')
    await user.click(reject)
    expect(onSubmit).toHaveBeenCalledWith('reject', 'Duplicate')
  })

  it('continues to the email template for more information', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BriefDecisionModal initialChoice="approve" onSubmit={onSubmit} onClose={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /Request more info/ }))
    await user.type(screen.getByLabelText(/Information needed/), 'Share documents')
    await user.click(screen.getByRole('button', { name: 'Continue to email' }))
    expect(onSubmit).toHaveBeenCalledWith('request_info', 'Share documents')
  })

  it('hints the agent recommendation, scrolls its body and closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <BriefDecisionModal
        initialChoice="approve"
        agentRecommendation="reject"
        onSubmit={vi.fn()}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Agent recommends')).toBeInTheDocument()
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
