import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ValueDueDiligenceStage } from './ValueDueDiligenceStage'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'

const base: PartnershipRequest = { ...INITIAL_PARTNERSHIP_REQUESTS[1], value: undefined }
const file = (name: string) => new File(['x'], name)

describe('ValueDueDiligenceStage', () => {
  it('lets the sponsor confirm the value assessment call, which happens externally', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ValueDueDiligenceStage request={base} role="sponsor" onAction={onAction} />)
    expect(screen.queryByRole('heading', { name: 'Business case' })).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I confirm the value assessment call has been completed',
      })
    )
    expect(onAction).toHaveBeenCalledWith({ type: 'confirmValueCall' })
  })

  it('has the Director wait for the sponsor', () => {
    render(<ValueDueDiligenceStage request={base} role="director" onAction={vi.fn()} />)
    expect(screen.getByText('Waiting for the lead sponsor.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('then asks the sponsor to upload the business case', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const request = { ...base, value: { callConfirmedOn: '19 Oct 2026' } }
    render(<ValueDueDiligenceStage request={request} role="sponsor" onAction={onAction} />)
    await user.upload(screen.getByLabelText('Upload business case'), file('case.pdf'))
    expect(onAction).toHaveBeenCalledWith({ type: 'businessCase', name: 'case.pdf' })
  })

  const withCase: PartnershipRequest = {
    ...base,
    value: {
      callConfirmedOn: '19 Oct 2026',
      businessCase: { name: 'case.pdf', uploadedOn: '20 Oct', uploadedBy: 'Parag' },
    },
  }

  it('fixes Reject and Proceed at the bottom for the sponsor, with a single popup', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ValueDueDiligenceStage request={withCase} role="sponsor" onAction={onAction} />)
    const bar = screen.getByText(
      /Review the business case, then record your decision/
    ).parentElement!
    expect(bar.className).toContain('sticky')
    await user.click(within(bar).getByRole('button', { name: 'Reject' }))
    const popup = screen.getByRole('dialog', { name: 'Reject this partnership' })
    expect(within(popup).getByRole('button', { name: 'Reject partnership' })).toBeDisabled()
    await user.type(within(popup).getByLabelText(/^Reason/), 'Weak case')
    await user.click(within(popup).getByRole('button', { name: 'Reject partnership' }))
    expect(screen.queryByRole('dialog', { name: 'Submit your decision?' })).not.toBeInTheDocument()
    expect(onAction).toHaveBeenCalledWith({
      type: 'valueDecision',
      status: 'rejected',
      reason: 'Weak case',
    })
  })

  it('proceeds without a reason', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ValueDueDiligenceStage request={withCase} role="sponsor" onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Proceed with this partnership' })).getByRole(
        'button',
        { name: 'Proceed' }
      )
    )
    expect(onAction).toHaveBeenCalledWith({
      type: 'valueDecision',
      status: 'proceeded',
      reason: '',
    })
  })

  it('shows no decision bar to the Director', () => {
    render(<ValueDueDiligenceStage request={withCase} role="director" onAction={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
    expect(screen.getByText('Waiting for the lead sponsor to decide.')).toBeInTheDocument()
  })

  it('has the sponsor upload the TDD report after a proceed', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const request = {
      ...withCase,
      value: {
        ...withCase.value,
        decision: { status: 'proceeded' as const, date: '21 Oct 2026' },
      },
    }
    render(<ValueDueDiligenceStage request={request} role="sponsor" onAction={onAction} />)
    expect(screen.queryByText('GENERATING')).not.toBeInTheDocument()
    await user.upload(screen.getByLabelText('Upload TDD report'), file('tdd.pdf'))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadTddReport', name: 'tdd.pdf' })
  })

  it('shows the uploaded TDD report, and a rejected case as closed', () => {
    const { unmount } = render(
      <ValueDueDiligenceStage
        request={{
          ...withCase,
          value: {
            ...withCase.value,
            decision: { status: 'proceeded', date: '21 Oct 2026' },
            tddReport: { name: 'tdd.pdf', uploadedOn: '22 Oct 2026', uploadedBy: 'Rashid' },
            tddGeneratedOn: '22 Oct 2026',
          },
        }}
        role="director"
        onAction={vi.fn()}
      />
    )
    expect(screen.getByText('tdd.pdf')).toBeInTheDocument()
    expect(screen.queryByLabelText('Upload TDD report')).not.toBeInTheDocument()
    unmount()
    render(
      <ValueDueDiligenceStage
        request={{
          ...withCase,
          value: {
            ...withCase.value,
            decision: { status: 'rejected', reason: 'Weak case', date: '21 Oct 2026' },
          },
        }}
        role="director"
        onAction={vi.fn()}
      />
    )
    expect(screen.getByText(/Rejected on 21 Oct 2026/)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Technical due diligence' })
    ).not.toBeInTheDocument()
  })
})
