import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AddQuestionModal } from './AddQuestionModal'

describe('AddQuestionModal', () => {
  it('needs question text and a response cue before it can be saved', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<AddQuestionModal onSave={onSave} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Add new question' })).toBeInTheDocument()

    const save = screen.getByRole('button', { name: 'Save question' })
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText(/Question text/), 'Describe your access controls')
    expect(save).toBeDisabled()
    await user.type(screen.getByLabelText(/Response cue/), 'Name the standards followed.')
    expect(save).toBeEnabled()

    // Mandatory by default; can be made optional
    expect(screen.getByRole('checkbox', { name: 'Mandatory question' })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Mandatory question' }))
    expect(screen.getByText(/leave this question blank/)).toBeInTheDocument()
    await user.click(save)
    expect(onSave).toHaveBeenCalledWith({
      text: 'Describe your access controls',
      cue: 'Name the standards followed.',
      mandatory: false,
    })
  })

  it('edits an existing question in the same popup, prefilled', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <AddQuestionModal
        initial={{ text: 'Old text', cue: 'Old cue', mandatory: false }}
        onSave={onSave}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('dialog', { name: 'Edit question' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Question text/)).toHaveValue('Old text')
    expect(screen.getByRole('checkbox', { name: 'Mandatory question' })).not.toBeChecked()
    await user.clear(screen.getByLabelText(/Question text/))
    await user.type(screen.getByLabelText(/Question text/), 'New text')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSave).toHaveBeenCalledWith({ text: 'New text', cue: 'Old cue', mandatory: false })
  })

  it('closes from the X, Cancel and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddQuestionModal onSave={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close question dialog' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('ignores spaces-only entries', async () => {
    const user = userEvent.setup()
    render(<AddQuestionModal onSave={vi.fn()} onClose={vi.fn()} />)
    await user.type(screen.getByLabelText(/Question text/), '   ')
    await user.type(screen.getByLabelText(/Response cue/), '   ')
    expect(screen.getByRole('button', { name: 'Save question' })).toBeDisabled()
  })
})
