import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DiscoveryCallStage } from './DiscoveryCallStage'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'

const base: PartnershipRequest = {
  ...INITIAL_PARTNERSHIP_REQUESTS[2],
  discovery: undefined,
}
const file = (name: string) => new File(['x'], name)

const renderStage = (
  request: PartnershipRequest,
  role: 'director' | 'sponsor' | 'viewer',
  extra: { onAction?: () => void; onNext?: () => void } = {}
) =>
  render(
    <DiscoveryCallStage
      request={request}
      role={role}
      onAction={extra.onAction ?? vi.fn()}
      onNext={extra.onNext ?? vi.fn()}
    />
  )

describe('DiscoveryCallStage', () => {
  it('lets the Director add notes, a transcript and a recording in one uploader, or skip', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onNext = vi.fn()
    renderStage(base, 'director', { onAction, onNext })
    expect(screen.getByRole('heading', { name: 'Discovery Call' })).toBeInTheDocument()
    const picker = screen.getByLabelText('Upload meeting notes, transcript or recording')
    await user.upload(picker, [file('notes.docx'), file('call.vtt'), file('call.mp4')])
    expect(onAction).toHaveBeenCalledWith({
      type: 'discoveryFile',
      kind: 'notes',
      name: 'notes.docx',
    })
    expect(onAction).toHaveBeenCalledWith({
      type: 'discoveryFile',
      kind: 'transcripts',
      name: 'call.vtt',
    })
    expect(onAction).toHaveBeenCalledWith({
      type: 'discoveryFile',
      kind: 'recordings',
      name: 'call.mp4',
    })
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'proceedToValue' })
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('hands the case to the sponsor with Proceed', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderStage(base, 'director', { onAction })
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'proceedToValue' })
  })

  it('has the sponsor wait, with no uploader, until the Director has handed on', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const { rerender } = renderStage(base, 'sponsor', { onNext })
    expect(screen.queryByLabelText('Upload meeting notes, transcript or recording')).toBeNull()
    expect(
      screen.getByText(/Waiting for the Director to hold the discovery call/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    rerender(
      <DiscoveryCallStage
        request={{
          ...base,
          discovery: {
            notes: [{ name: 'notes.docx', uploadedOn: '2 Oct', uploadedBy: 'Zaid' }],
            recordings: [],
            proceededOn: '3 Oct 2026',
          },
        }}
        role="sponsor"
        onAction={vi.fn()}
        onNext={onNext}
      />
    )
    expect(screen.getByRole('list', { name: 'Meeting notes' })).toHaveTextContent('notes.docx')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onNext).toHaveBeenCalled()
  })
})
