import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AddDocumentsModal } from './AddDocumentsModal'

const file = (name: string, size = 2 * 1024 * 1024) => new File([new Uint8Array(size)], name)

const renderModal = () => {
  const onAdd = vi.fn()
  const onClose = vi.fn()
  render(<AddDocumentsModal onAdd={onAdd} onClose={onClose} />)
  return { onAdd, onClose }
}

describe('AddDocumentsModal', () => {
  it('lists the selected files with their type and size, and adds them', async () => {
    const user = userEvent.setup()
    const { onAdd } = renderModal()
    expect(screen.getByRole('dialog', { name: 'Add supporting documents' })).toBeInTheDocument()
    const add = screen.getByRole('button', { name: 'Add documents' })
    expect(add).toBeDisabled()
    await user.upload(screen.getByLabelText('Supporting documents'), [
      file('Market_Overview_2026.pdf'),
      file('Strategic_Priorities.docx', 1.1 * 1024 * 1024),
      file('Financial_Projections.xlsx', 850 * 1024),
    ])
    expect(screen.getByText('Selected files (3)')).toBeInTheDocument()
    const list = within(screen.getByRole('list', { name: 'Selected files' }))
    expect(list.getByText('PDF · 2.0 MB')).toBeInTheDocument()
    expect(list.getByText('DOCX · 1.1 MB')).toBeInTheDocument()
    expect(list.getByText('XLSX · 850 KB')).toBeInTheDocument()
    await user.click(add)
    expect(onAdd).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Market_Overview_2026.pdf', source: 'Uploaded by you' }),
      expect.objectContaining({ name: 'Strategic_Priorities.docx' }),
      expect.objectContaining({ name: 'Financial_Projections.xlsx' }),
    ])
  })

  it('removes one file or all of them', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.upload(screen.getByLabelText('Supporting documents'), [
      file('a.pdf'),
      file('b.docx'),
    ])
    await user.click(screen.getByRole('button', { name: 'Remove a.pdf' }))
    expect(screen.getByText('Selected files (1)')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove all' }))
    expect(screen.queryByText(/Selected files/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add documents' })).toBeDisabled()
  })

  it('rejects unsupported and oversized files and ignores duplicates', () => {
    renderModal()
    const input = screen.getByLabelText('Supporting documents')
    fireEvent.change(input, {
      target: { files: [file('x.png'), file('big.pdf', 21 * 1024 * 1024), file('ok.pdf')] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('x.png is not a supported file type.')
    expect(screen.getByRole('alert')).toHaveTextContent('big.pdf is larger than 20 MB.')
    expect(screen.getByText('Selected files (1)')).toBeInTheDocument()
    fireEvent.change(input, { target: { files: [file('ok.pdf')] } })
    expect(screen.getByText('Selected files (1)')).toBeInTheDocument()
  })

  it('accepts dropped files, scrolls inside and closes', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    const zone = screen.getByText(/Drag and drop files here/).closest('div')!
    fireEvent.drop(zone, { dataTransfer: { files: [file('dropped.docx')] } })
    expect(screen.getByText('dropped.docx')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close add documents' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
