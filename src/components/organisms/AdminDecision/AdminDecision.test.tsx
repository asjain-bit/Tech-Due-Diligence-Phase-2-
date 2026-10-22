import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AdminDecision } from './AdminDecision'

const confidence = { Partnership: 'High', Procure: 'Medium', 'M&A': 'Low' } as const

describe('AdminDecision', () => {
  it('lets the admin reject with a reason', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AdminDecision typeConfidence={confidence} canEdit onSubmit={onSubmit} />)

    const submit = screen.getByRole('button', { name: /Submit decision/i })
    expect(submit).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: /Reject request/i }))
    expect(screen.queryByRole('radiogroup', { name: 'Case type' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/^Reason/), 'Out of scope')
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith({
      action: 'reject',
      type: undefined,
      reason: 'Out of scope',
    })
  })

  it('needs a case type to proceed, each with the agent confidence', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AdminDecision typeConfidence={confidence} canEdit onSubmit={onSubmit} />)

    await user.click(screen.getByRole('radio', { name: /^Proceed/i }))
    const types = screen.getByRole('radiogroup', { name: 'Case type' })
    expect(types).toHaveTextContent('Partnership')
    expect(types).toHaveTextContent('Procure')
    expect(types).toHaveTextContent('M&A')
    expect(screen.getByLabelText('Partnership confidence High')).toBeInTheDocument()
    expect(screen.getByLabelText('Procure confidence Medium')).toBeInTheDocument()
    expect(screen.getByLabelText('M&A confidence Low')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^Reason/), 'Fits the pilot route')
    const submit = screen.getByRole('button', { name: /Submit decision/i })
    expect(submit).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: /Procure/i }))
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith({
      action: 'proceed',
      type: 'Procure',
      reason: 'Fits the pilot route',
    })
  })

  it('keeps every option card the same style, only the radio dot changes', async () => {
    const user = userEvent.setup()
    render(<AdminDecision typeConfidence={confidence} canEdit onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /^Proceed/i }))
    const [a, b, c] = screen
      .getByRole('radiogroup', { name: 'Case type' })
      .querySelectorAll('[role=radio]')
    await user.click(a)
    expect(a.className).toBe(b.className)
    expect(b.className).toBe(c.className)
  })

  it('shows a recorded decision locked and lets the admin edit it until the Director decides', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <AdminDecision
        typeConfidence={confidence}
        canEdit
        onSubmit={onSubmit}
        submitted={{ action: 'proceed', type: 'Procure', reason: 'Licence it', date: 'Just now' }}
      />
    )
    expect(screen.getByRole('radio', { name: /Procure/i, checked: true })).toBeDisabled()
    expect(screen.getByDisplayValue('Licence it')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Edit submission/i }))
    await user.click(screen.getByRole('radio', { name: /Partnership/i }))
    await user.click(screen.getByRole('button', { name: /Update submission/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      action: 'proceed',
      type: 'Partnership',
      reason: 'Licence it',
    })
  })

  it('cancels an edit and restores the locked view', async () => {
    const user = userEvent.setup()
    render(
      <AdminDecision
        typeConfidence={confidence}
        canEdit
        onSubmit={vi.fn()}
        submitted={{ action: 'reject', reason: 'No fit', date: 'Just now' }}
      />
    )
    await user.click(screen.getByRole('button', { name: /Edit submission/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: /Edit submission/i })).toBeInTheDocument()
  })

  it('cannot be edited once the Director has decided', () => {
    render(
      <AdminDecision
        typeConfidence={confidence}
        canEdit={false}
        onSubmit={vi.fn()}
        submitted={{ action: 'proceed', type: 'Partnership', reason: 'Go', date: 'Just now' }}
      />
    )
    expect(screen.queryByRole('button', { name: /Edit submission/i })).not.toBeInTheDocument()
    expect(screen.getByText(/The Director has decided/)).toBeInTheDocument()
  })
})
