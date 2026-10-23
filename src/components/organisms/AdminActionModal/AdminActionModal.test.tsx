import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AdminActionModal } from './AdminActionModal'

const confidence = { Partnership: 'High', Procure: 'Medium', 'M&A': 'Low' } as const

const renderModal = (props: Partial<React.ComponentProps<typeof AdminActionModal>> = {}) => {
  const onConfirm = vi.fn()
  const onClose = vi.fn()
  render(
    <AdminActionModal
      mode="proceed"
      typeConfidence={confidence}
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />
  )
  return { onConfirm, onClose }
}

describe('AdminActionModal (proceed)', () => {
  it('picks the request type from a dropdown that shows the agent confidence, and a reason that is not marked optional', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal()
    expect(screen.getByRole('dialog', { name: 'Proceed with this case' })).toBeInTheDocument()
    expect(screen.queryByText(/optional/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Reason')).toBeInTheDocument()

    const proceed = screen.getByRole('button', { name: 'Proceed' })
    expect(proceed).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Request type/ }))
    const list = screen.getByRole('listbox', { name: 'Request type' })
    expect(within(list).getByLabelText('Partnership confidence High')).toBeInTheDocument()
    expect(within(list).getByLabelText('Procure confidence Medium')).toBeInTheDocument()
    expect(within(list).getByLabelText('M&A confidence Low')).toBeInTheDocument()
    await user.click(
      within(list)
        .getByRole('option', { name: /Procure/ })
        .querySelector('button')!
    )
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(proceed).toBeEnabled()

    await user.click(proceed)
    expect(onConfirm).toHaveBeenCalledWith({ action: 'proceed', type: 'Procure', reason: '' })
  })

  it('sends the optional reason along', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal({ initialType: 'Partnership', initialReason: 'Good fit' })
    expect(screen.getByRole('button', { name: /Request type/ })).toHaveTextContent('Partnership')
    expect(screen.getByLabelText(/^Reason/)).toHaveValue('Good fit')
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onConfirm).toHaveBeenCalledWith({
      action: 'proceed',
      type: 'Partnership',
      reason: 'Good fit',
    })
  })

  it('closes the dropdown first with Escape, then the dialog', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    await user.click(screen.getByRole('button', { name: /Request type/ }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('AdminActionModal (reject)', () => {
  it('needs a reason and has no request type', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal({ mode: 'reject' })
    expect(screen.getByRole('dialog', { name: 'Reject this case' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Request type/ })).not.toBeInTheDocument()
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()

    const reject = screen.getByRole('button', { name: 'Reject request' })
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), '   ')
    expect(reject).toBeDisabled()
    await user.type(screen.getByLabelText(/^Reason/), 'Out of scope')
    expect(reject).toBeEnabled()
    await user.click(reject)
    expect(onConfirm).toHaveBeenCalledWith({
      action: 'reject',
      type: undefined,
      reason: 'Out of scope',
    })
  })

  it('closes with the X and Cancel', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal({ mode: 'reject' })
    await user.click(screen.getByRole('button', { name: 'Close decision' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
