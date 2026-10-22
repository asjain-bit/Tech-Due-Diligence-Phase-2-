import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BriefDecision } from './BriefDecision'

describe('BriefDecision', () => {
  it('offers approve, reject and request more info with a mandatory Reason', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BriefDecision onSubmit={onSubmit} />)

    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual([
      expect.stringContaining('Approve for internal review'),
      expect.stringContaining('Reject request'),
      expect.stringContaining('Request more info'),
    ])
    expect(screen.getByLabelText(/^Reason/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Decision rationale/i)).not.toBeInTheDocument()

    const submit = screen.getByRole('button', { name: /Submit decision/i })
    expect(submit).toBeDisabled()
    expect(screen.getByText('0 / 500')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^Reason/), 'Because')
    expect(submit).toBeDisabled()
    expect(screen.getByText('7 / 500')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Request more info/i }))
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalledWith('request_info', 'Because')
  })

  it('only fills the radio dot: every option keeps the same card style', async () => {
    const user = userEvent.setup()
    render(<BriefDecision onSubmit={vi.fn()} />)
    const [approve, reject] = screen.getAllByRole('radio')
    const before = approve.className
    await user.click(approve)
    expect(approve.className).toBe(before)
    expect(approve.className).toBe(reject.className)
    expect(approve).toHaveAttribute('aria-checked', 'true')
  })

  it('changes the Reason placeholder for a request for information', async () => {
    const user = userEvent.setup()
    render(<BriefDecision onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /Request more info/i }))
    expect(screen.getByPlaceholderText(/What information do you need/i)).toBeInTheDocument()
  })

  it('ignores a reason made only of spaces', async () => {
    const user = userEvent.setup()
    render(<BriefDecision onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
    await user.type(screen.getByLabelText(/^Reason/), '   ')
    expect(screen.getByRole('button', { name: /Submit decision/i })).toBeDisabled()
  })

  it('hints at the agent recommendation', () => {
    const { rerender } = render(<BriefDecision agentRecommendation="proceed" onSubmit={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Approve for internal review/i })).toHaveTextContent(
      'Agent recommends'
    )
    rerender(<BriefDecision agentRecommendation="reject" onSubmit={vi.fn()} />)
    expect(screen.getByRole('radio', { name: /Reject request/i })).toHaveTextContent(
      'Agent recommends'
    )
    expect(screen.getByRole('radio', { name: /Request more info/i })).not.toHaveTextContent(
      'Agent recommends'
    )
  })

  it('locks once a decision is recorded', () => {
    render(
      <BriefDecision onSubmit={vi.fn()} submitted={{ decision: 'approve', reason: 'Strong fit' }} />
    )
    expect(
      screen.getByRole('radio', { name: /Approve for internal review/i, checked: true })
    ).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Reject request/i })).toBeDisabled()
    expect(screen.getByDisplayValue('Strong fit')).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
  })

  it('locks with no reason text when none was recorded', () => {
    render(<BriefDecision onSubmit={vi.fn()} submitted={{ decision: 'reject' }} />)
    expect(screen.getByLabelText(/^Reason/)).toHaveValue('')
  })
})
