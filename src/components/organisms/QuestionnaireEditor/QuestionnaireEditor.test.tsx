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
  const [current, setCurrent] = useState(1)
  const questions = (versions.find((v) => v.version === current) ?? versions[0]).questions
  const save = (next: QuestionnaireQuestion[], label: string) => {
    const version = Math.max(...versions.map((v) => v.version)) + 1
    setVersions((v) => [...v, { version, label, questions: next }])
    setCurrent(version)
  }
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
        setCurrent(1)
      }}
      questions={questions}
      onQuestionsChange={save}
      versions={versions}
      currentVersion={current}
      onSelectVersion={setCurrent}
    />
  )
}

const startEditing = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Edit' }))

describe('QuestionnaireEditor', () => {
  it('shows the questionnaire full width with plain question cards and no versions yet', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Questionnaire')).toHaveValue('technical')
    expect(
      screen.getByLabelText('Questionnaire').parentElement?.parentElement?.className
    ).toContain('w-full')
    // Mandatory shows as a red asterisk, not a chip
    const card = screen.getByTestId('question-1')
    expect(within(card).getByLabelText('mandatory')).toHaveClass('text-red-500')
    expect(screen.queryByText('Mandatory')).not.toBeInTheDocument()
    expect(screen.queryByText('Optional')).not.toBeInTheDocument()
    expect(screen.queryByText(/Research needed|Attachment required/)).not.toBeInTheDocument()
    // Until it has been edited there are no versions to show
    expect(screen.queryByLabelText('Version')).not.toBeInTheDocument()
    // Not editable until Edit is switched on
    expect(document.querySelectorAll('[draggable="true"]')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: /Delete question/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit question/ })).not.toBeInTheDocument()
  })

  it('has Edit and Add question as text-only buttons, and Edit makes every question editable', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const edit = screen.getByRole('button', { name: 'Edit' })
    expect(edit.className).not.toMatch(/\bborder\b|bg-white/)
    expect(screen.getByRole('button', { name: 'Add question' }).className).not.toMatch(/\bborder\b/)
    await user.click(edit)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelectorAll('[draggable="true"]')).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /Delete question/ })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /Edit question/ })).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(document.querySelectorAll('[draggable="true"]')).toHaveLength(0)
  })

  it('opens the question popup, prefilled, from the question itself and saves a version', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await startEditing(user)
    await user.click(screen.getByRole('button', { name: 'Edit question 2' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit question' })
    expect(within(dialog).getByLabelText(/Question text/)).toHaveValue(
      getQuestionnaire('technical').questions[1].text
    )
    await user.clear(within(dialog).getByLabelText(/Question text/))
    await user.type(within(dialog).getByLabelText(/Question text/), 'Is it certified?')
    await user.click(within(dialog).getByRole('checkbox', { name: 'Required question' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const card = screen.getByTestId('question-2')
    expect(within(card).getByText(/Is it certified\?/)).toBeInTheDocument()
    expect(within(card).queryByLabelText('mandatory')).not.toBeInTheDocument()
    // The first edit makes the version dropdown appear
    expect(screen.getByLabelText('Version')).toHaveValue('2')
  })

  it('switches questionnaire and goes back to no versions', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await startEditing(user)
    await user.click(screen.getByRole('button', { name: 'Delete question 3' }))
    expect(screen.getByLabelText('Version')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Questionnaire'), 'internal-evaluation')
    expect(screen.queryByLabelText('Version')).not.toBeInTheDocument()
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(5)
  })

  it('reorders questions by dragging and saves a version', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await startEditing(user)
    const handles = document.querySelectorAll('[draggable="true"]')
    const third = screen.getByTestId('question-3')
    fireEvent.dragStart(handles[0])
    fireEvent.dragOver(third)
    fireEvent.drop(third)
    expect(screen.getByLabelText('Version')).toHaveValue('2')
    fireEvent.drop(screen.getByTestId('question-1')) // nothing is being dragged
    expect(screen.getByLabelText('Version')).toHaveValue('2')
  })

  it('lists the versions in the dropdown and switches back to an earlier one', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await startEditing(user)
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(2)
    const versions = screen.getByLabelText('Version')
    expect(
      within(versions)
        .getAllByRole('option')
        .map((o) => o.textContent)
    ).toEqual(['v2 · Deleted question 1', 'v1 · Original'])
    await user.selectOptions(versions, '1')
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(3)
    expect(versions).toHaveValue('1')
  })

  it('deletes a question and says so when none are left', async () => {
    const user = userEvent.setup()
    render(<Harness initial="clinical-safety" />)
    await startEditing(user)
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
    await user.click(within(dialog).getByRole('checkbox', { name: 'Required question' }))
    await user.click(within(dialog).getByRole('button', { name: 'Save question' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(4)
    expect(
      within(screen.getByTestId('question-4')).queryByLabelText('mandatory')
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add question' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Add new question' })).getByRole('button', {
        name: 'Cancel',
      })
    )
    expect(screen.getAllByTestId(/^question-/)).toHaveLength(4)
  })
})
