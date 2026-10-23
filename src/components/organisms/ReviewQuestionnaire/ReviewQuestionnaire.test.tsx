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
  it('shows each question with its response cue and no attachment controls', () => {
    render(<Harness />)
    expect(screen.getByText(questions[0].text)).toBeInTheDocument()
    expect(screen.getByText(questions[0].cue)).toBeInTheDocument()
    expect(screen.getByText('0 of 3 mandatory answered')).toBeInTheDocument()
    expect(screen.queryByText(/Attachment|Attach file/)).not.toBeInTheDocument()
  })

  it('needs every mandatory answer before submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Harness onSubmit={onSubmit} />)
    const submit = screen.getByRole('button', { name: 'Submit' })
    expect(submit).toBeDisabled()

    const boxes = screen.getAllByRole('textbox')
    await user.type(boxes[0], 'Clinical decision support')
    await user.type(boxes[1], 'Yes, a hazard analysis was done')
    expect(screen.getByText('2 of 3 mandatory answered')).toBeInTheDocument()
    expect(submit).toBeDisabled()
    await user.type(boxes[2], 'AES-256 with per-tenant keys')
    expect(submit).toBeEnabled()
    await user.click(submit)
    expect(onSubmit).toHaveBeenCalled()
  })

  it('lets an optional question stay blank', async () => {
    const user = userEvent.setup()
    const mixed = questions.map((q, i) => ({ ...q, mandatory: i !== 2 }))
    render(
      <ReviewQuestionnaire
        questions={mixed}
        answers={{ [mixed[0].id]: { answer: 'a' }, [mixed[1].id]: { answer: 'b' } }}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText('(optional)')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 mandatory answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
  })

  it('shows a submitted response read-only in the same layout', () => {
    render(
      <ReviewQuestionnaire
        readOnly
        questions={questions}
        answers={{ [questions[0].id]: { answer: 'Clinical decision support' } }}
      />
    )
    expect(screen.getByDisplayValue('Clinical decision support')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByText(/answered/)).not.toBeInTheDocument()
  })
})
