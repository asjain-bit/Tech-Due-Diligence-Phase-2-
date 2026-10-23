import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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
      { version: 1, fileName: 'nda_v1.pdf', uploadedOn: '14 Oct 2026', uploadedBy: 'Zaid Al Ali' },
      { version: 2, fileName: 'nda_v2.pdf', uploadedOn: '15 Oct 2026', uploadedBy: 'Zaid Al Ali' },
    ],
  },
  alignmentPackOn: '14 Oct 2026',
}
const file = (name: string) => new File(['x'], name)

const renderStage = (
  request: PartnershipRequest,
  role: 'director' | 'sponsor',
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
  it('opens on the read-only template with a download of the original file', () => {
    renderStage(base, 'director')
    expect(
      screen.getByText(/Download the NDA template, complete it with the vendor/)
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'NDA Execution Form' })).toBeInTheDocument()
    const download = screen.getByRole('link', { name: /Download/ })
    expect(download).toHaveAttribute('href', NDA_TEMPLATE_URL)
    expect(download).toHaveAttribute('download')
    expect(screen.getByLabelText('NDA execution form')).toHaveClass('overflow-y-auto')
  })

  it('keeps the acknowledgement and Proceed in a footer fixed at the bottom', async () => {
    const user = userEvent.setup()
    renderStage(base, 'director')
    const checkbox = screen.getByRole('checkbox', {
      name: 'I acknowledge that the document has been signed by the vendor',
    })
    const bar = checkbox.closest('div.sticky') as HTMLElement
    expect(bar.className).toContain('bottom-0')
    expect(within(bar).getByRole('button', { name: /Proceed/ })).toBeDisabled()
    await user.click(checkbox)
    expect(within(bar).getByRole('button', { name: /Proceed/ })).toBeEnabled()
  })

  it('asks for the signed copy in a popup before moving on', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderStage(base, 'director', { onAction })
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    const popup = screen.getByRole('dialog', { name: 'Upload signed NDA' })
    await user.upload(
      within(popup).getByLabelText('Signed NDA file'),
      file('MedTech_Signed_NDA.pdf')
    )
    await user.click(within(popup).getByRole('button', { name: 'Upload' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadNda', fileName: 'MedTech_Signed_NDA.pdf' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('replaces the template with the signed copy once it is uploaded, then goes on to the pack', async () => {
    const user = userEvent.setup()
    const request = { ...signedRequest, nda: { versions: [signedRequest.nda!.versions[0]] } }
    const { rerender } = renderStage(base, 'director')
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    await user.upload(screen.getByLabelText('Signed NDA file'), file('nda_v1.pdf'))
    await user.click(screen.getByRole('button', { name: 'Upload' }))
    rerender(
      <NdaDiscoveryStage request={request} role="director" onAction={vi.fn()} onNext={vi.fn()} />
    )

    expect(
      screen.getByText('The signed NDA has been uploaded. You can review the document below.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Download/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Signed NDA Execution Form' })).toBeInTheDocument()
    // The acknowledgement stays, ticked and locked
    expect(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    ).toBeChecked()
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
  })

  it('shows the version in a dropdown next to the title and allows a new version', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderStage(signedRequest, 'director', { onAction })
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    const versions = screen.getByLabelText('NDA version')
    expect(versions).toHaveValue('2')
    expect(
      within(versions)
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['v2 (current) · 15 Oct 2026', 'v1 · 14 Oct 2026'])
    expect(screen.getByText('nda_v2.pdf')).toBeInTheDocument()
    await user.selectOptions(versions, '1')
    expect(screen.getByText('nda_v1.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Upload new version' }))
    const popup = screen.getByRole('dialog', { name: 'Upload signed NDA' })
    expect(within(popup).getByText(/becomes version 3/)).toBeInTheDocument()
    await user.upload(within(popup).getByLabelText('Signed NDA file'), file('nda_v3.docx'))
    await user.click(within(popup).getByRole('button', { name: 'Upload' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadNda', fileName: 'nda_v3.docx' })
  })
})

describe('NdaDiscoveryStage: the alignment pack screen', () => {
  it('opens on the alignment pack once the NDA is signed, with Back and a fixed Next', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    renderStage(signedRequest, 'director', { onNext })
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Download/ })).not.toBeInTheDocument()
    const next = screen.getByRole('button', { name: /Next/ })
    expect(next.closest('div.sticky')?.className).toContain('bottom-0')
    await user.click(next)
    expect(onNext).toHaveBeenCalled()
  })

  it('includes the discovery call as a section, waiting for the sponsor on the Director side', () => {
    renderStage(signedRequest, 'director')
    expect(screen.getByRole('heading', { name: 'Discovery Call' })).toBeInTheDocument()
    expect(screen.getByText('Waiting for the lead sponsor.')).toBeInTheDocument()
  })

  it('lets the sponsor add notes and recordings and confirm the discovery call', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    renderStage(signedRequest, 'sponsor', { onAction })
    await user.upload(screen.getByLabelText('Upload call notes'), file('notes.docx'))
    await user.upload(screen.getByLabelText('Upload call recording'), file('call.mp4'))
    expect(onAction).toHaveBeenCalledWith({
      type: 'discoveryFile',
      kind: 'notes',
      name: 'notes.docx',
    })
    expect(onAction).toHaveBeenCalledWith({
      type: 'discoveryFile',
      kind: 'recordings',
      name: 'call.mp4',
    })
    await user.click(screen.getByRole('button', { name: 'Confirm discovery call completed' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'confirmDiscovery' })
  })

  it('shows a confirmed discovery call with its files', () => {
    renderStage(
      {
        ...signedRequest,
        discovery: {
          notes: [{ name: 'notes.docx', uploadedOn: '2 Oct', uploadedBy: 'Parag' }],
          recordings: [],
          confirmedOn: '3 Oct 2026',
        },
      },
      'sponsor'
    )
    expect(screen.getByText('Discovery call completed on 3 Oct 2026')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Discovery notes' })).toHaveTextContent('notes.docx')
    expect(screen.queryByLabelText('Upload call notes')).not.toBeInTheDocument()
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
    renderStage(signedRequest, 'sponsor')
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
    expect(screen.getByRole('heading', { name: 'Signed NDA Execution Form' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload new version' })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Proceed/ }))
    expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
  })
})
