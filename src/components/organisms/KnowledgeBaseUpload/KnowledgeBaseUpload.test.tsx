import React, { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { KnowledgeBaseUpload } from './KnowledgeBaseUpload'
import type { KnowledgeBaseFile } from './KnowledgeBaseUpload.types'

const Harness = ({ onGenerate = vi.fn() }: { onGenerate?: () => void }) => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([])
  return <KnowledgeBaseUpload files={files} onFilesChange={setFiles} onGenerate={onGenerate} />
}

const file = (name: string, size = 2048) => new File([new Uint8Array(size)], name)

describe('KnowledgeBaseUpload', () => {
  it('shows the Prepare Pre-read Summary screen', () => {
    render(<Harness />)
    expect(screen.getByRole('heading', { name: 'Prepare Pre-read Summary' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'These documents are in the knowledge base now. Remove any you do not need, or upload more to help the agent generate the pre-read summary.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Upload supporting documents')).toBeInTheDocument()
    expect(screen.getByText('PDF, DOCX, XLSX · Max 20 MB per file')).toBeInTheDocument()
    expect(screen.getByText(/Only the documents selected here will be used\./)).toBeInTheDocument()
    // Nothing is pre-selected
    expect(screen.queryByRole('list', { name: 'Knowledge base documents' })).not.toBeInTheDocument()
  })

  it('generates the summary with or without documents, and has no skip button', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<Harness onGenerate={onGenerate} />)
    expect(screen.queryByRole('button', { name: /Skip/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Generate Summary' }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('opens the Add supporting documents popup from Browse files and adds what was picked', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Browse files' }))
    const popup = screen.getByRole('dialog', { name: 'Add supporting documents' })
    await user.upload(within(popup).getByLabelText('Supporting documents'), [
      file('plan.pdf'),
      file('model.xlsx'),
    ])
    await user.click(within(popup).getByRole('button', { name: 'Add documents' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const list = within(screen.getByRole('list', { name: 'Knowledge base documents' }))
    expect(list.getAllByRole('listitem')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'Remove plan.pdf' }))
    expect(
      within(screen.getByRole('list', { name: 'Knowledge base documents' })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(1)
  })

  it('does not add the same document twice', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    for (let i = 0; i < 2; i++) {
      await user.click(screen.getByRole('button', { name: 'Browse files' }))
      await user.upload(screen.getByLabelText('Supporting documents'), file('plan.pdf'))
      await user.click(screen.getByRole('button', { name: 'Add documents' }))
    }
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })
})
