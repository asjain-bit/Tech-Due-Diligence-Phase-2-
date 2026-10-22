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

const next = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Next' }))

describe('SendInternalModal', () => {
  it('shows the questionnaire first, without the reviewers', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Send to Internal Interest' })).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument()
    expect(screen.getByLabelText('Questionnaire')).toHaveValue('internal-evaluation')
    expect(
      screen.getByLabelText('Questionnaire').parentElement?.parentElement?.className
    ).toContain('w-full')
    expect(screen.getByText('(5 questions)')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Riza Sayeed' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Send Request' })).not.toBeInTheDocument()
  })

  it('scrolls inside the popup instead of growing it', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-h-[90vh]')
    expect(dialog.querySelector('.overflow-y-auto')).not.toBeNull()
  })

  it('swaps to the reviewers and a note once the questions are set', async () => {
    const user = userEvent.setup()
    renderModal()
    await next(user)
    expect(screen.getByText(/Step 2 of 2/)).toBeInTheDocument()
    expect(screen.getByText('(5 selected)')).toBeInTheDocument()
    expect(screen.queryByLabelText('Questionnaire')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Note to Internal Interest')).toHaveValue('Hi team')
    expect(screen.getByText('Response due in 5 business days')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByLabelText('Questionnaire')).toBeInTheDocument()
  })

  it('sends only after a final confirmation, with the chosen reviewers and questions', async () => {
    const user = userEvent.setup()
    const { onSend } = renderModal()
    await user.selectOptions(screen.getByLabelText('Questionnaire'), 'technical')
    await user.click(screen.getByRole('button', { name: 'Delete question 3' }))
    await next(user)
    await user.click(screen.getByRole('checkbox', { name: 'Riza Sayeed' }))

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
    await next(user)
    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Send to Internal Interest?' })).getByRole(
        'button',
        { name: 'Cancel' }
      )
    )
    expect(
      screen.queryByRole('dialog', { name: 'Send to Internal Interest?' })
    ).not.toBeInTheDocument()
    expect(onSend).not.toHaveBeenCalled()
  })

  it('cannot move on without valid questions or send without reviewers', async () => {
    const user = userEvent.setup()
    renderModal()
    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.clear(screen.getByTestId('question-1').querySelector('input') as HTMLInputElement)
    expect(nextButton).toBeDisabled()
    expect(screen.getByText('Every question needs text and a response cue.')).toBeInTheDocument()
    for (let i = 5; i >= 1; i--) {
      await user.click(screen.getByRole('button', { name: `Delete question ${i}` }))
    }
    expect(screen.getByText('Add at least one question.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add question' }))
    const dialog = screen.getByRole('dialog', { name: 'Add new question' })
    await user.type(within(dialog).getByLabelText(/Question text/), 'Is it safe?')
    await user.type(within(dialog).getByLabelText(/Response cue/), 'Yes or no')
    await user.click(within(dialog).getByRole('button', { name: 'Save question' }))
    await next(user)

    for (const m of DEFAULT_INTERNAL_INTERESTS) {
      await user.click(screen.getByRole('checkbox', { name: m.name }))
    }
    expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled()
    expect(screen.getByText('Select at least one reviewer.')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Riza Sayeed' }))
    expect(screen.getByRole('button', { name: 'Send Request' })).toBeEnabled()
  })

  it('toggles a reviewer with the keyboard and closes with the X and Cancel', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await next(user)
    const box = screen.getByRole('checkbox', { name: 'Parag Agarwal' })
    box.focus()
    await user.keyboard(' ')
    expect(box).toHaveAttribute('aria-checked', 'false')
    await user.keyboard('{Enter}')
    expect(box).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('button', { name: 'Close send to Internal Interest' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
