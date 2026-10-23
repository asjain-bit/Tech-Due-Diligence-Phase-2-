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
const file = (name: string) => new File(['x'], name)

describe('NdaDiscoveryStage', () => {
  it('shows the read-only template with a download of the original file', () => {
    render(<NdaDiscoveryStage request={base} role="director" onAction={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'NDA Execution Form' })).toBeInTheDocument()
    const download = screen.getByRole('link', { name: /Download/ })
    expect(download).toHaveAttribute('href', NDA_TEMPLATE_URL)
    expect(download).toHaveAttribute('download')
    expect(screen.getByLabelText('NDA execution form')).toHaveClass('overflow-y-auto')
  })

  it('asks for the vendor-signed acknowledgement before the signed copy can be uploaded', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<NdaDiscoveryStage request={base} role="director" onAction={onAction} />)
    expect(screen.queryByLabelText('Upload signed copy')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.upload(screen.getByLabelText('Upload signed copy'), file('signed.pdf'))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadNda', fileName: 'signed.pdf' })
  })

  it('shows the signed copy with version history and allows a new version', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const request = {
      ...base,
      nda: {
        versions: [
          {
            version: 1,
            fileName: 'nda_v1.pdf',
            uploadedOn: '14 Oct 2026',
            uploadedBy: 'Zaid Al Ali',
          },
          {
            version: 2,
            fileName: 'nda_v2.pdf',
            uploadedOn: '15 Oct 2026',
            uploadedBy: 'Zaid Al Ali',
          },
        ],
      },
    }
    render(<NdaDiscoveryStage request={request} role="director" onAction={onAction} />)
    expect(screen.getByText(/Signed copy · Version 2/)).toBeInTheDocument()
    const history = within(screen.getByRole('list', { name: 'NDA version history' }))
    expect(history.getAllByRole('listitem')).toHaveLength(2)
    expect(history.getByText('Current')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Upload new version' }))
    await user.upload(screen.getByLabelText('Upload a new version'), file('nda_v3.docx'))
    expect(onAction).toHaveBeenCalledWith({ type: 'uploadNda', fileName: 'nda_v3.docx' })
  })

  it('is read-only for the sponsor', () => {
    render(<NdaDiscoveryStage request={base} role="sponsor" onAction={vi.fn()} />)
    expect(
      screen.getByText(/Waiting for the Director to upload the signed copy/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  const withPack = {
    ...base,
    nda: {
      versions: [{ version: 1, fileName: 'n.pdf', uploadedOn: '1 Oct', uploadedBy: 'Zaid Al Ali' }],
    },
    alignmentPackOn: '1 Oct 2026',
  }

  it('shows the alignment pack once it is generated', () => {
    render(<NdaDiscoveryStage request={withPack} role="director" onAction={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Alignment pack' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Open questions' })).toBeInTheDocument()
    expect(screen.getByText('Waiting for the lead sponsor.')).toBeInTheDocument()
  })

  it('lets the sponsor add notes and recordings and confirm the discovery call', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<NdaDiscoveryStage request={withPack} role="sponsor" onAction={onAction} />)
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
    render(
      <NdaDiscoveryStage
        request={{
          ...withPack,
          discovery: {
            notes: [{ name: 'notes.docx', uploadedOn: '2 Oct', uploadedBy: 'Parag' }],
            recordings: [],
            confirmedOn: '3 Oct 2026',
          },
        }}
        role="sponsor"
        onAction={vi.fn()}
      />
    )
    expect(screen.getByText('Discovery call completed on 3 Oct 2026')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Discovery notes' })).toHaveTextContent('notes.docx')
    expect(screen.queryByLabelText('Upload call notes')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Confirm discovery/ })).not.toBeInTheDocument()
  })
})
