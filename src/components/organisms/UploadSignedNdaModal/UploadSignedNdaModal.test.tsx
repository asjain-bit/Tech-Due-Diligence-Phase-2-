import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { UploadSignedNdaModal } from './UploadSignedNdaModal'

const file = (name: string, size = 2 * 1024 * 1024) => new File([new Uint8Array(size)], name)

const renderModal = (nextVersion = 1) => {
  const onUpload = vi.fn()
  const onClose = vi.fn()
  render(<UploadSignedNdaModal nextVersion={nextVersion} onUpload={onUpload} onClose={onClose} />)
  return { onUpload, onClose }
}

describe('UploadSignedNdaModal', () => {
  it('shows the picked file with its size and uploads it', async () => {
    const user = userEvent.setup()
    const { onUpload } = renderModal()
    expect(screen.getByRole('dialog', { name: 'Upload signed NDA' })).toBeInTheDocument()
    expect(screen.getByText('PDF · DOCX · Max 20 MB')).toBeInTheDocument()
    const upload = screen.getByRole('button', { name: 'Upload' })
    expect(upload).toBeDisabled()
    await user.upload(screen.getByLabelText('Signed NDA file'), file('MedTech_Signed_NDA.pdf'))
    expect(screen.getByText('MedTech_Signed_NDA.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 MB')).toBeInTheDocument()
    await user.click(upload)
    expect(onUpload).toHaveBeenCalledWith('MedTech_Signed_NDA.pdf')
  })

  it('lets the file be removed again', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.upload(screen.getByLabelText('Signed NDA file'), file('a.pdf'))
    await user.click(screen.getByRole('button', { name: 'Remove a.pdf' }))
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })

  it('rejects other types and oversized files', () => {
    renderModal()
    const input = screen.getByLabelText('Signed NDA file')
    fireEvent.change(input, { target: { files: [file('x.png')] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Only PDF or Word files')
    fireEvent.change(input, { target: { files: [file('big.pdf', 21 * 1024 * 1024)] } })
    expect(screen.getByRole('alert')).toHaveTextContent('larger than 20 MB')
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })

  it('accepts a dropped file and says a later upload replaces the copy as a new version', () => {
    renderModal(3)
    expect(screen.getByText(/becomes version 3/)).toBeInTheDocument()
    const zone = screen.getByText(/Drag and drop the signed document here/).closest('div')!
    fireEvent.drop(zone, { dataTransfer: { files: [file('dropped.docx')] } })
    expect(screen.getByText('dropped.docx')).toBeInTheDocument()
  })

  it('scrolls inside, and closes from the X, Cancel and Escape', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    await user.click(screen.getByRole('button', { name: 'Close upload' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
