import React, { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
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
  it('is optional: generate is available without any file', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<Harness onGenerate={onGenerate} />)
    expect(screen.getByText(/Optional/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Generate pre-read summary' }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('adds PowerPoint, Word and Excel files and removes them again', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByLabelText('Knowledge base files')
    await user.upload(input, [
      file('deck.pptx'),
      file('notes.docx'),
      file('model.xlsx', 3 * 1024 * 1024),
    ])
    const list = screen.getByRole('list', { name: 'Added files' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(within(list).getByText('3.0 MB')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove notes.docx' }))
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('rejects other file types and ignores duplicates', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Knowledge base files')
    fireEvent.change(input, { target: { files: [file('image.png'), file('deck.pptx')] } })
    expect(screen.getByRole('alert')).toHaveTextContent('image.png is not supported')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    fireEvent.change(input, { target: { files: [file('deck.pptx')] } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('accepts dropped files', () => {
    render(<Harness />)
    const zone = screen.getByText('Drag files here').closest('div')!.parentElement!
    fireEvent.dragOver(zone)
    fireEvent.drop(zone, { dataTransfer: { files: [file('plan.doc')] } })
    expect(screen.getByText('plan.doc')).toBeInTheDocument()
  })
})
