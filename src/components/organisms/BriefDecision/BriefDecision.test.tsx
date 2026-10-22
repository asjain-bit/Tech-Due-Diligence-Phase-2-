import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BriefDecision } from './BriefDecision'

describe('BriefDecision', () => {
  it('needs both a decision and a rationale before it can be submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BriefDecision onSubmit={onSubmit} />)

    const submit = screen.getByRole('button', { name: /Submit decision/i })
    expect(submit).toBeDisabled()
    expect(screen.getByText('0 / 500')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Decision rationale/i), 'Because')
    expect(submit).toBeDisabled()
    expect(screen.getByText('7 / 500')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Reject request/i }))
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith('reject', 'Because')
  })

  it('ignores a rationale made only of spaces', async () => {
    const user = userEvent.setup()
    render(<BriefDecision onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
    await user.type(screen.getByLabelText(/Decision rationale/i), '   ')
    expect(screen.getByRole('button', { name: /Submit decision/i })).toBeDisabled()
  })

  it('hints at the agent recommendation and supports Back', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const { rerender } = render(
      <BriefDecision agentRecommendation="proceed" onSubmit={vi.fn()} onBack={onBack} />
    )
    expect(screen.getByText('Agent recommends')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back/i }))
    expect(onBack).toHaveBeenCalled()

    rerender(<BriefDecision agentRecommendation="reject" onSubmit={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Reject request/i })).toHaveTextContent(
      'Agent recommends'
    )
    expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument()
  })

  it('locks once a decision is recorded', () => {
    render(
      <BriefDecision
        onSubmit={vi.fn()}
        submitted={{ decision: 'approve', rationale: 'Strong fit' }}
      />
    )
    expect(
      screen.getByRole('radio', { name: /Approve for internal review/i, checked: true })
    ).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Reject request/i })).toBeDisabled()
    expect(screen.getByDisplayValue('Strong fit')).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
  })
})
