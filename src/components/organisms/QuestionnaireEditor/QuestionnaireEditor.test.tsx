import React, { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { QuestionnaireEditor } from './QuestionnaireEditor'
import type { QuestionnaireVersion } from './QuestionnaireEditor.types'
import type { QuestionnaireQuestion } from '@/types/partnership.types'
import { cloneQuestions, getQuestionnaire } from '@/types/questionnaires'

const Harness = ({ initial = 'technical' }: { initial?: string }) => {
  const [id, setId] = useState(initial)
  const [versions, setVersions] = useState<QuestionnaireVersion[]>(() => [
    {
      version: 1,
      label: 'Original',
      questions: cloneQuestions(getQuestionnaire(initial).questions),
    },
  ])
  const questions = versions[versions.length - 1].questions
  const save = (next: QuestionnaireQuestion[], label: string) =>
    setVersions((v) => [...v, { version: v.length + 1, label, questions: next }])
  return (
    <QuestionnaireEditor
      questionnaireId={id}
      onQuestionnaireChange={(next) => {
        setId(next)
        setVersions([
          {
            version: 1,
            label: 'Original',
            questions: cloneQuestions(getQuestionnaire(next).questions),
          },
        ])
      }}
      questions={questions}
      onQuestionsChange={save}
      versions={versions}
      onRestore={(n) =>
        save(cloneQuestions(versions.find((v) => v.version === n)!.questions), `Restored v${n}`)
      }
    />
  )
}

describe('QuestionnaireEditor', () => {
  it('shows the questionnaire full width with read-only question cards', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Questionnaire')).toHaveValue('technical')
    expect(
      screen.getByLabelText('Questionnaire').parentElement?.parentElement?.className
    ).toContain('w-full')
    expect(within(screen.getByTestId('question-1')).getByText('Mandatory')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByText(/Research needed|Attachment required/)).not.toBeInTheDocument()
    // no up/down arrows, only the drag handle
    expect(screen.queryByRole('button', { name: /Move question/ })).not.toBeInTheDocument()
    expect(document.querySelectorAll('[draggable="true"]')).toHaveLength(3)
    expect(screen.getByLabelText('Version 1')).toBeInTheDocument()
  })

  it('switches questionnaire and starts again at v1', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Delete question 3' }))
    expect(screen.getByLabelText('Version 2')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Questionnaire'), 'internal-evaluation')
    expect(screen.getByLabelText('Version 1')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(5)
  })

  it('reorders questions by dragging and saves a version', () => {
    render(<Harness />)
    const handles = document.querySelectorAll('[draggable="true"]')
    const third = screen.getByTestId('question-3')
    fireEvent.dragStart(handles[0])
    fireEvent.dragOver(third)
    fireEvent.drop(third)
    expect(screen.getByLabelText('Version 2')).toBeInTheDocument()
    fireEvent.drop(screen.getByTestId('question-1')) // nothing is being dragged
    expect(screen.getByLabelText('Version 2')).toBeInTheDocument()
  })

  it('edits a question in the popup, prefilled, and saves a version', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Edit question 2' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit question' })
    expect(within(dialog).getByLabelText(/Question text/)).toHaveValue(
      getQuestionnaire('technical').questions[1].text
    )
    await user.clear(within(dialog).getByLabelText(/Question text/))
    await user.type(within(dialog).getByLabelText(/Question text/), 'Is it certified?')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Mandatory question' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const card = screen.getByTestId('question-2')
    expect(within(card).getByText('Is it certified?')).toBeInTheDocument()
    expect(within(card).getByText('Optional')).toBeInTheDocument()
    expect(screen.getByLabelText('Version 2')).toBeInTheDocument()
  })

  it('lists the versions and restores an earlier one as a new version', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.queryByRole('button', { name: 'Version history' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: /Version history/ }))
    const history = screen.getByRole('list', { name: 'Version history' })
    expect(within(history).getAllByRole('listitem')).toHaveLength(2)
    expect(within(history).getByText('Current')).toBeInTheDocument()
    await user.click(within(history).getByRole('button', { name: 'Restore version 1' }))
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(3)
    expect(screen.getByLabelText('Version 3')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Version history' })).getByText(/Restored v1/)
    ).toBeInTheDocument()
  })

  it('deletes a question and says so when none are left', async () => {
    const user = userEvent.setup()
    render(<Harness initial="clinical-safety" />)
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.queryAllByTestId(/^question-/)).toHaveLength(0)
    expect(screen.getByText(/No questions yet/)).toBeInTheDocument()
  })

  it('adds a mandatory or optional question from the popup', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Add question' }))
    const dialog = screen.getByRole('dialog', { name: 'Add new question' })
    await user.type(within(dialog).getByLabelText(/Question text/), 'Which hospitals use it today?')
    await user.type(within(dialog).getByLabelText(/Response cue/), 'Name the sites.')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Mandatory question' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save question' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(4)
    expect(within(screen.getByTestId('question-4')).getByText('Optional')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add question' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Add new question' })).getByRole('button', {
        name: 'Cancel',
      })
    )
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(4)
  })
})
