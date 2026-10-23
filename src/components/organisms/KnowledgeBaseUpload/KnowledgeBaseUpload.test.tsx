import React, { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { KnowledgeBaseUpload } from './KnowledgeBaseUpload'
import type { KnowledgeBaseFile } from './KnowledgeBaseUpload.types'

const SEEDED: KnowledgeBaseFile[] = [
  { name: 'M42_Roadmap_Register.xlsx', size: 1024, source: 'M42 knowledge base' },
  { name: 'News_Trends_Agent_KB_Extract.docx', size: 2048, source: 'M42 knowledge base' },
]

const Harness = ({
  onGenerate = vi.fn(),
  initial = SEEDED,
  onViewBrief,
}: {
  onGenerate?: () => void
  initial?: KnowledgeBaseFile[]
  onViewBrief?: () => void
}) => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>(initial)
  return (
    <KnowledgeBaseUpload
      files={files}
      onFilesChange={setFiles}
      onGenerate={onGenerate}
      onViewBrief={onViewBrief}
    />
  )
}

const file = (name: string, size = 2048) => new File([new Uint8Array(size)], name)

describe('KnowledgeBaseUpload', () => {
  it('shows the prepare screen with the selected M42 knowledge base documents', () => {
    render(<Harness />)
    expect(
      screen.getByRole('heading', { name: 'Prepare Initial Assessment Brief' })
    ).toBeInTheDocument()
    expect(screen.getByText('Upload supporting documents')).toBeInTheDocument()
    expect(screen.getByText(/Max 20 MB per file/)).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
    const list = within(screen.getByRole('list', { name: 'Knowledge base documents' }))
    expect(list.getAllByRole('listitem')).toHaveLength(2)
    expect(list.getAllByText('M42 knowledge base')).toHaveLength(2)
    expect(
      screen.getByText('Only documents selected for this assessment will be used.')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The agent will compare the vendor submission against the selected documents.'
      )
    ).toBeInTheDocument()
  })

  it('has no skip button, only Generate Pre-read Summary', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<Harness onGenerate={onGenerate} />)
    expect(screen.queryByRole('button', { name: /Skip/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Generate Pre-read Summary' }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  it('removes a document and uploads more, marked as uploaded by the user', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Remove M42_Roadmap_Register.xlsx' }))
    expect(screen.getByText('(1)')).toBeInTheDocument()
    await user.upload(screen.getByLabelText('Knowledge base files'), [
      file('deck.pptx'),
      file('policy.pdf'),
    ])
    expect(screen.getByText('(3)')).toBeInTheDocument()
    expect(screen.getAllByText('Uploaded by you')).toHaveLength(2)
  })

  it('rejects unsupported and oversized files, and ignores duplicates', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Knowledge base files')
    fireEvent.change(input, {
      target: { files: [file('image.png'), file('big.pdf', 21 * 1024 * 1024)] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('image.png is not a supported file type.')
    expect(screen.getByRole('alert')).toHaveTextContent('big.pdf is larger than 20 MB.')
    fireEvent.change(input, { target: { files: [file('M42_Roadmap_Register.xlsx')] } })
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('accepts dropped files and offers the brief', async () => {
    const user = userEvent.setup()
    const onViewBrief = vi.fn()
    render(<Harness onViewBrief={onViewBrief} />)
    const zone = screen.getByText('Upload supporting documents').closest('div')!.parentElement!
    fireEvent.dragOver(zone)
    fireEvent.drop(zone, { dataTransfer: { files: [file('plan.doc')] } })
    expect(screen.getByText('plan.doc')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View initial assessment brief' }))
    expect(onViewBrief).toHaveBeenCalled()
  })
})
