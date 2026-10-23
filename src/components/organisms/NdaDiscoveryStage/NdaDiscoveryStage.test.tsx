import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { NdaDiscoveryStage, NDA_TEMPLATE_URL } from './NdaDiscoveryStage'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'

const base: PartnershipRequest = {
  ...INITIAL_PARTNERSHIP_REQUESTS[1],
  nda: undefined,
  alignmentPackOn: undefined,
  discovery: undefined,
}
const signedRequest: PartnershipRequest = {
  ...base,
  nda: {
    versions: [
      {
        version: 1,
        signed: false,
        fileName: 'ADHDS_NDA_Execution_Form_v1.0.docx',
        uploadedOn: '14 Oct 2026',
        uploadedBy: 'Zaid Al Ali',
      },
      {
        version: 2,
        signed: true,
        fileName: 'nda_v2.pdf',
        uploadedOn: '14 Oct 2026',
        uploadedBy: 'Zaid Al Ali',
      },
      {
        version: 3,
        signed: true,
        fileName: 'nda_v3.pdf',
        uploadedOn: '15 Oct 2026',
        uploadedBy: 'Zaid Al Ali',
      },
    ],
  },
  alignmentPackOn: '14 Oct 2026',
}
const file = (name: string) => new File(['x'], name)

const renderStage = (
  request: PartnershipRequest,
  role: 'director' | 'sponsor' | 'viewer',
  extra: { onAction?: () => void; onNext?: () => void } = {}
) =>
  render(
    <NdaDiscoveryStage
      request={request}
      role={role}
      onAction={extra.onAction ?? vi.fn()}
      onNext={extra.onNext ?? vi.fn()}
    />
  )

describe('NdaDiscoveryStage: the Director signs the NDA', () => {
  afterEach(() => vi.useRealTimers())

  it('puts Download in the same row as the title, and drops the template heading', () => {
    renderStage(base, 'director')
    const title = screen.getByRole('heading', { level: 2, name: 'NDA & Discovery' })
    const download = screen.getByRole('link', { name: /Download/ })
    expect(download.parentElement).toBe(title.parentElement)
    expect(download).toHaveAttribute('href', NDA_TEMPLATE_URL)
    expect(download).toHaveAttribute('download')
    expect(screen.queryByRole('heading', { name: 'NDA template' })).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Download the NDA template, complete it with the vendor/)
    ).not.toBeInTheDocument()
  })

  it('fills the page height: the form scrolls on its own and the footer stays', () => {
    const { container } = renderStage(base, 'director')
    expect((container.firstChild as HTMLElement).className).toContain('h-full')
    const form = screen.getByLabelText('NDA execution form')
    expect(form.className).toContain('overflow-y-auto')
    expect(form.className).toContain('flex-1')
    const checkbox = screen.getByRole('checkbox', {
      name: 'I acknowledge that the document has been signed by the vendor',
    })
    expect((checkbox.closest('div.sticky') as HTMLElement).className).toContain('bottom-0')
  })

  it('asks for the signed copy in a popup before moving on', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderStage(base, 'director', { onAction })
    const proceed = screen.getByRole('button', { name: /Proceed/ })
    expect(proceed).toBeDisabled()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.click(proceed)
    const popup = screen.getByRole('dialog', { name: 'Upload signed NDA' })
    await user.upload(
      within(popup).getByLabelText('Signed NDA file'),
      file('MedTech_Signed_NDA.pdf')
    )
    await user.click(within(popup).getByRole('button', { name: 'Upload' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadNda', fileName: 'MedTech_Signed_NDA.pdf' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lists the unsigned template and the signed copy as two versions in a dropdown', async () => {
    const user = userEvent.setup()
    const two = { ...signedRequest, nda: { versions: signedRequest.nda!.versions.slice(0, 2) } }
    renderStage(two, 'director')
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    const versions = screen.getByLabelText('NDA version')
    expect(versions).toHaveValue('2')
    expect(
      within(versions)
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['v2 (current) · signed copy', 'v1 · unsigned template'])
    expect(screen.getByRole('heading', { name: 'Signed NDA' })).toBeInTheDocument()
    await user.selectOptions(versions, '1')
    expect(screen.getByRole('heading', { name: 'Unsigned template' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'NDA Execution Form' })).toBeInTheDocument()
  })

  it('offers no new version once the signed copy is uploaded', async () => {
    const user = userEvent.setup()
    renderStage(signedRequest, 'director')
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    expect(screen.queryByRole('button', { name: 'Upload new version' })).not.toBeInTheDocument()
  })

  it('plays the generating animation before the alignment pack, only the first time', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const two = { ...signedRequest, nda: { versions: signedRequest.nda!.versions.slice(0, 2) } }
    const { rerender } = renderStage(base, 'director')
    // sign: the request gets its signed copy
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    await user.upload(screen.getByLabelText('Signed NDA file'), file('nda_v2.pdf'))
    await user.click(screen.getByRole('button', { name: 'Upload' }))
    rerender(
      <NdaDiscoveryStage request={two} role="director" onAction={vi.fn()} onNext={vi.fn()} />
    )

    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(screen.getByText('GENERATING')).toBeInTheDocument()
    expect(screen.getByText('NDA & Discovery').parentElement).toHaveClass('hidden')
    expect(screen.getByText(/Collecting the brief and the Director decision/)).toBeInTheDocument()
    for (let i = 0; i < 5; i++) act(() => vi.advanceTimersByTime(900))
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()

    // Going back and forward again skips the animation
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(screen.queryByText('GENERATING')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
  })
})

describe('NdaDiscoveryStage: the alignment pack screen', () => {
  it('opens on the alignment pack once signed, as one document with no side navigation', () => {
    renderStage(signedRequest, 'director')
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Alignment pack sections' })
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Sent to')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Executive Summary' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Open Questions' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Download/ })).not.toBeInTheDocument()
  })

  it('has the sponsor wait for the Director before Next to the last stage', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const { rerender } = renderStage(signedRequest, 'sponsor', { onNext })
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled()
    expect(screen.getByText(/Waiting for the Director to hand this on/)).toBeInTheDocument()
    rerender(
      <NdaDiscoveryStage
        request={{
          ...signedRequest,
          discovery: { notes: [], recordings: [], proceededOn: '17 Oct 2026' },
        }}
        role="sponsor"
        onAction={vi.fn()}
        onNext={onNext}
      />
    )
    await user.click(screen.getByRole('button', { name: /Next/ }))
    expect(onNext).toHaveBeenCalled()
  })

  it('lets the Director add optional context after Next in one uploader, or skip it', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onNext = vi.fn()
    renderStage(signedRequest, 'director', { onAction, onNext })
    await user.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
    expect(screen.queryByText(/optional/i)).not.toBeInTheDocument()
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

  it('moves on with Proceed after uploading', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onNext = vi.fn()
    renderStage(signedRequest, 'director', { onAction, onNext })
    await user.click(screen.getByRole('button', { name: /Next/ }))
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(onAction).toHaveBeenCalledWith({ type: 'proceedToValue' })
    expect(onNext).toHaveBeenCalled()
  })

  it('shows the uploaded context in the pack, view-only, once the Director has moved on', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    renderStage(
      {
        ...signedRequest,
        discovery: {
          notes: [{ name: 'notes.docx', uploadedOn: '2 Oct', uploadedBy: 'Parag' }],
          transcripts: [],
          recordings: [],
          proceededOn: '3 Oct 2026',
        },
      },
      'sponsor',
      { onNext }
    )
    expect(screen.getByRole('list', { name: 'Meeting notes' })).toHaveTextContent('notes.docx')
    expect(screen.queryByLabelText('Upload meeting notes')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Next/ }))
    expect(onNext).toHaveBeenCalled()
    expect(screen.queryByLabelText('Upload meeting notes, transcript or recording')).toBeNull()
  })
})

describe('NdaDiscoveryStage: everyone else', () => {
  it('never shows the template, only a wait until the NDA is signed', () => {
    renderStage(base, 'sponsor')
    expect(
      screen.getByText(/Waiting for the Director to upload the signed NDA/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'NDA Execution Form' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Download/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('opens straight on the alignment pack, and Back shows the signed NDA, read-only', async () => {
    const user = userEvent.setup()
    renderStage(signedRequest, 'viewer')
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    expect(screen.getByRole('heading', { name: 'Signed NDA' })).toBeInTheDocument()
    expect(screen.getByLabelText('NDA version')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload new version' })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
  })
})
