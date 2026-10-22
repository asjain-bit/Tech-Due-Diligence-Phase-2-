import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ReviewQuestionnaire } from './ReviewQuestionnaire'
import type { QuestionAnswerValue } from './ReviewQuestionnaire.types'
import { getQuestionnaire } from '@/types/questionnaires'

const questions = getQuestionnaire('technical').questions

const Harness = ({ onSubmit = vi.fn() }: { onSubmit?: () => void }) => {
  const [answers, setAnswers] = useState<Record<string, QuestionAnswerValue>>({})
  return (
    <ReviewQuestionnaire
      questions={questions}
      answers={answers}
      onChange={(id, patch) =>
        setAnswers((p) => ({
          ...p,
          [id]: { ...({ answer: '' } as QuestionAnswerValue), ...p[id], ...patch },
        }))
      }
      onSubmit={onSubmit}
    />
  )
}

describe('ReviewQuestionnaire', () => {
  it('shows each question with its response cue', () => {
    render(<Harness />)
    expect(screen.getByText(questions[0].text)).toBeInTheDocument()
    expect(screen.getByText(questions[0].cue)).toBeInTheDocument()
    expect(screen.getByText('0 of 3 answered')).toBeInTheDocument()
    expect(screen.getAllByText('Attachment required').length).toBe(2)
  })

  it('needs every answer, and every required attachment, before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    const submit = screen.getByRole('button', { name: 'Submit' })
    expect(submit).toBeDisabled()

    const boxes = screen.getAllByRole('textbox')
    await user.type(boxes[0], 'Clinical decision support')
    await user.type(boxes[1], 'Yes, a hazard analysis was done')
    await user.type(boxes[2], 'AES-256 with per-tenant keys')
    expect(screen.getByText('1 of 3 answered')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    const attach = screen.getAllByRole('button', { name: 'Attach file' })
    expect(attach).toHaveLength(2)
    await user.click(attach[0])
    expect(screen.getAllByRole('button', { name: 'Attach file' })).toHaveLength(1)
    expect(screen.getByText(/describe-the-primary-clinica.*\.pdf/)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Attach file' })[0])
    expect(submit).toBeEnabled()
    expect(screen.getByText('3 of 3 answered')).toBeInTheDocument()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalled()
  })

  it('removes an attachment again', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getAllByRole('button', { name: 'Attach file' })[0])
    await user.click(screen.getByRole('button', { name: 'Remove attachment from question 1' }))
    expect(screen.getAllByRole('button', { name: 'Attach file' })).toHaveLength(2)
  })

  it('shows a submitted response read-only in the same layout', () => {
    render(
      <ReviewQuestionnaire
        readOnly
        questions={questions}
        answers={{
          [questions[0].id]: { answer: 'Clinical decision support', attachment: 'use-cases.pdf' },
        }}
      />
    )
    expect(screen.getByDisplayValue('Clinical decision support')).toBeDisabled()
    expect(screen.getByText('use-cases.pdf')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Attach file' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove attachment/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/answered/)).not.toBeInTheDocument()
  })
})
