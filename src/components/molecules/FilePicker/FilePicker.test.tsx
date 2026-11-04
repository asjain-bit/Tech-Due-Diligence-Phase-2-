import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilePicker } from './FilePicker'

const file = (name: string) => new File(['x'], name)

describe('FilePicker', () => {
  it('hands over the names of the files it accepts', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<FilePicker label="Upload signed copy" accept=".pdf,.docx" onPick={onPick} />)
    await user.upload(screen.getByLabelText('Upload signed copy'), file('nda.pdf'))
    expect(onPick).toHaveBeenCalledWith(['nda.pdf'])
  })

  it('rejects other types and says so', () => {
    const onPick = vi.fn()
    render(<FilePicker label="Upload" accept=".pdf" onPick={onPick} />)
    fireEvent.change(screen.getByLabelText('Upload'), { target: { files: [file('x.png')] } })
    expect(onPick).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Only .pdf files')
  })

  it('accepts dropped files', () => {
    const onPick = vi.fn()
    render(<FilePicker label="Upload" accept=".mp4" onPick={onPick} />)
    const zone = screen.getByText('Upload').closest('div')!
    fireEvent.drop(zone, { dataTransfer: { files: [file('call.mp4')] } })
    expect(onPick).toHaveBeenCalledWith(['call.mp4'])
  })
})
