import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
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

  const proceeded = {
    ...withCase,
    value: {
      ...withCase.value,
      decision: { status: 'proceeded' as const, date: '21 Oct 2026' },
    },
  }

  it('fills in the TDD report by itself after a proceed, with the simple animation', () => {
    vi.useFakeTimers()
    const onAction = vi.fn()
    render(<ValueDueDiligenceStage request={proceeded} role="sponsor" onAction={onAction} />)
    expect(screen.getByText('GENERATING')).toBeInTheDocument()
    expect(screen.queryByLabelText('Upload TDD report')).not.toBeInTheDocument()
    for (let i = 0; i < 5; i++) act(() => vi.advanceTimersByTime(1100))
    expect(onAction).toHaveBeenCalledWith({ type: 'generateTdd' })
    vi.useRealTimers()
  })

  it('asks the sponsor for the final answer once the report is in', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const request = {
      ...proceeded,
      value: { ...proceeded.value, tddGeneratedOn: '22 Oct 2026' },
    }
    const { unmount } = render(
      <ValueDueDiligenceStage request={request} role="sponsor" onAction={onAction} />
    )
    expect(screen.getByRole('list', { name: 'TDD report' })).toBeInTheDocument()
    // The report is laid out as a PDF document
    expect(screen.getByText(/TDD_Report_PR-\d+\.pdf/)).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'TDD report document' })).toBeInTheDocument()
    // Each answer asks for a confirmation first
    await user.click(screen.getByRole('button', { name: 'Yes, sponsor' }))
    expect(onAction).not.toHaveBeenCalled()
    const yes = screen.getByRole('dialog', { name: 'Sponsor this partnership?' })
    await user.click(within(yes).getByRole('button', { name: 'Yes, sponsor' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'finalSponsor', sponsor: true })
    await user.click(screen.getByRole('button', { name: 'No, do not sponsor' }))
    const no = screen.getByRole('dialog', { name: 'Do not sponsor?' })
    expect(within(no).getByRole('button', { name: 'Yes, do not sponsor' }).className).toContain(
      'bg-red-600'
    )
    await user.click(within(no).getByRole('button', { name: 'Yes, do not sponsor' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'finalSponsor', sponsor: false })
    unmount()
    // The Director just waits, then sees the answer
    const { unmount: again } = render(
      <ValueDueDiligenceStage request={request} role="director" onAction={vi.fn()} />
    )
    expect(screen.getByText('Waiting for the sponsor to answer.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yes, sponsor' })).not.toBeInTheDocument()
    again()
    render(
      <ValueDueDiligenceStage
        request={{
          ...request,
          value: {
            ...request.value,
            finalDecision: { status: 'sponsored', date: '23 Oct 2026' },
            sponsoredOn: '23 Oct 2026',
          },
        }}
        role="sponsor"
        onAction={vi.fn()}
      />
    )
    expect(screen.getByText('Sponsored on 23 Oct 2026')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yes, sponsor' })).not.toBeInTheDocument()
  })

  it('shows a rejected case as closed', () => {
    const { unmount } = render(<div />)
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
