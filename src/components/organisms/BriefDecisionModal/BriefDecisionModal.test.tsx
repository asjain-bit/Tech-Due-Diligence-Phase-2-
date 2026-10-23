import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BriefDecisionModal } from './BriefDecisionModal'
import type { BriefDecisionModalProps } from './BriefDecisionModal.types'

const email = { to: 'sarah@vendor.com', subject: 'More info', body: 'Hi Sarah' }

const renderModal = (props: Partial<BriefDecisionModalProps> = {}) => {
  const onSubmit = vi.fn()
  const onRequestInfo = vi.fn()
  const onClose = vi.fn()
  render(
    <BriefDecisionModal
      email={email}
      onSubmit={onSubmit}
      onRequestInfo={onRequestInfo}
      onClose={onClose}
      {...props}
    />
  )
  return { onSubmit, onRequestInfo, onClose }
}

const choose = (user: ReturnType<typeof userEvent.setup>, option: string) =>
  user.selectOptions(screen.getByLabelText(/^Decision/), option)

describe('BriefDecisionModal', () => {
  it('starts with a Decision dropdown offering Proceed, Reject and Request more info', () => {
    renderModal()
    const select = screen.getByLabelText(/^Decision/)
    expect(select).toHaveValue('')
    expect(
      within(select)
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['Select a decision', 'Proceed', 'Reject', 'Request more info'])
    // Nothing else until a decision is chosen
    expect(screen.queryByLabelText(/^Reason/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Proceed' })).toBeDisabled()
  })

  it('proceeds with a reason that is not marked optional and can be left blank', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()
    await choose(user, 'Proceed')
    expect(screen.getByLabelText('Reason')).toBeInTheDocument()
    expect(screen.queryByText(/optional/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onSubmit).toHaveBeenCalledWith('approve', '')
  })

  it('needs a reason to reject', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderModal()
    await choose(user, 'Reject')
    const reject = screen.getByRole('button', { name: 'Reject request' })
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), 'Duplicate')
    await user.click(reject)
    expect(onSubmit).toHaveBeenCalledWith('reject', 'Duplicate')
  })

  it('shows the email template in the same popup, with a copy button on each field', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    const { onRequestInfo } = renderModal()
    await choose(user, 'Request more info')
    const group = within(screen.getByRole('group', { name: 'Email to the vendor' }))
    expect(group.getByText('sarah@vendor.com')).toBeInTheDocument()
    expect(group.getByLabelText('Subject')).toHaveValue('More info')
    expect(group.getByLabelText('Message')).toHaveValue('Hi Sarah')
    expect(screen.queryByLabelText(/^Reason/)).not.toBeInTheDocument()
    expect(group.getAllByRole('button', { name: /^Copy / })).toHaveLength(3)

    await user.click(group.getByRole('button', { name: 'Copy recipient' }))
    expect(writeText).toHaveBeenCalledWith('sarah@vendor.com')

    await user.clear(group.getByLabelText('Subject'))
    await user.type(group.getByLabelText('Subject'), 'Need documents')
    await user.click(screen.getByRole('button', { name: 'Mark information requested' }))
    expect(onRequestInfo).toHaveBeenCalledWith({
      to: 'sarah@vendor.com',
      subject: 'Need documents',
      body: 'Hi Sarah',
    })
  })

  it('cannot send an empty email', async () => {
    const user = userEvent.setup()
    renderModal()
    await choose(user, 'Request more info')
    await user.clear(screen.getByLabelText('Message'))
    expect(screen.getByRole('button', { name: 'Mark information requested' })).toBeDisabled()
  })

  it('hints the agent recommendation, scrolls its body and closes', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal({ agentRecommendation: 'reject' })
    expect(screen.getByText('Agent recommends: Reject')).toBeInTheDocument()
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
