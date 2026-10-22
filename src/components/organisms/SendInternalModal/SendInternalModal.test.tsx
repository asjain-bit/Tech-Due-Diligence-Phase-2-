import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SendInternalModal } from './SendInternalModal'
import { DEFAULT_INTERNAL_INTERESTS } from '@/types/partnership.types'

const renderModal = () => {
  const onSend = vi.fn()
  const onClose = vi.fn()
  render(
    <SendInternalModal
      members={DEFAULT_INTERNAL_INTERESTS}
      defaultNote="Hi team"
      onSend={onSend}
      onClose={onClose}
    />
  )
  return { onSend, onClose }
}

describe('SendInternalModal', () => {
  it('lines up reviewers, the questionnaire and a note', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Send to Internal Interest' })).toBeInTheDocument()
    expect(screen.getByText('(5 selected)')).toBeInTheDocument()
    expect(screen.getByLabelText('Questionnaire')).toHaveValue('internal-evaluation')
    expect(screen.getByText('(5 questions)')).toBeInTheDocument()
    expect(screen.getByLabelText('Note to Internal Interest')).toHaveValue('Hi team')
    expect(screen.getByText('Response due in 5 business days')).toBeInTheDocument()
  })

  it('sends only after a final confirmation, with the chosen reviewers and questions', async () => {
    const user = userEvent.setup()
    const { onSend } = renderModal()
    await user.click(screen.getByRole('checkbox', { name: 'Riza Sayeed' }))
    await user.selectOptions(screen.getByLabelText('Questionnaire'), 'technical')
    await user.click(screen.getByRole('button', { name: 'Delete question 3' }))

    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    expect(onSend).not.toHaveBeenCalled()
    const confirm = screen.getByRole('dialog', { name: 'Send to Internal Interest?' })
    expect(confirm).toHaveTextContent('2 questions and 4 reviewers will be sent')
    expect(confirm).toHaveTextContent('you will not be able to edit them')
    await user.click(within(confirm).getByRole('button', { name: 'Send Request' }))

    expect(onSend).toHaveBeenCalledTimes(1)
    const payload = onSend.mock.calls[0][0]
    expect(payload.memberIds).toHaveLength(4)
    expect(payload.memberIds).not.toContain('int-1')
    expect(payload.questionnaire.name).toBe('Technical Questionnaire')
    expect(payload.questionnaire.questions).toHaveLength(2)
    expect(payload.note).toBe('Hi team')
  })

  it('goes back from the confirmation without sending', async () => {
    const user = userEvent.setup()
    const { onSend } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Send to Internal Interest?' })).getByRole(
        'button',
        {
          name: 'Cancel',
        }
      )
    )
    expect(
      screen.queryByRole('dialog', { name: 'Send to Internal Interest?' })
    ).not.toBeInTheDocument()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('cannot send without reviewers or valid questions', async () => {
    const user = userEvent.setup()
    renderModal()
    const send = screen.getByRole('button', { name: 'Send Request' })
    for (const m of DEFAULT_INTERNAL_INTERESTS) {
      await user.click(screen.getByRole('checkbox', { name: m.name }))
    }
    expect(send).toBeDisabled()
    expect(screen.getByText('Select at least one reviewer.')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Riza Sayeed' }))
    expect(send).toBeEnabled()
    await user.clear(screen.getByTestId('question-1').querySelector('input') as HTMLInputElement)
    expect(send).toBeDisabled()
    expect(screen.getByText('Every question needs text and a response cue.')).toBeInTheDocument()

    for (let i = 5; i >= 1; i--) {
      await user.click(screen.getByRole('button', { name: `Delete question ${i}` }))
    }
    expect(screen.getByText('Add at least one question.')).toBeInTheDocument()
  })

  it('toggles a reviewer with the keyboard and closes with the X', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    const box = screen.getByRole('checkbox', { name: 'Parag Agarwal' })
    box.focus()
    await user.keyboard(' ')
    expect(box).toHaveAttribute('aria-checked', 'false')
    await user.keyboard('{Enter}')
    expect(box).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('button', { name: 'Close send to Internal Interest' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
