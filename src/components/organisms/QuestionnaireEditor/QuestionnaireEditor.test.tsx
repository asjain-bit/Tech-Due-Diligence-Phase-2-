import React, { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { QuestionnaireEditor } from './QuestionnaireEditor'
import { cloneQuestions, getQuestionnaire } from '@/types/questionnaires'

const Harness = ({ initial = 'technical' }: { initial?: string }) => {
  const [id, setId] = useState(initial)
  const [questions, setQuestions] = useState(() =>
    cloneQuestions(getQuestionnaire(initial).questions)
  )
  return (
    <QuestionnaireEditor
      questionnaireId={id}
      onQuestionnaireChange={(next) => {
        setId(next)
        setQuestions(cloneQuestions(getQuestionnaire(next).questions))
      }}
      questions={questions}
      onQuestionsChange={setQuestions}
    />
  )
}

const texts = () =>
  screen
    .getAllByRole('listitem')
    .map((li) => (within(li).getByLabelText(/^Question \*/) as HTMLInputElement).value.slice(0, 18))

describe('QuestionnaireEditor', () => {
  it('shows the selected questionnaire with every question as an editable card', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Questionnaire')).toHaveValue('technical')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    const first = screen.getByTestId('question-1')
    expect(within(first).getByText('Question 1')).toBeInTheDocument()
    expect(within(first).getByLabelText(/^Question \*/)).toHaveValue(
      'Describe the primary clinical or operational use cases supported by your solution.'
    )
    expect((within(first).getByLabelText(/Response cue/) as HTMLTextAreaElement).value).toContain(
      'Specify whether workflows are clinical'
    )
    expect(within(first).getByRole('checkbox', { name: 'Research needed' })).toBeChecked()
    expect(within(first).getByRole('checkbox', { name: 'Attachment required' })).toBeChecked()
    const second = screen.getByTestId('question-2')
    expect(within(second).getByRole('checkbox', { name: 'Research needed' })).not.toBeChecked()
  })

  it('switches to another questionnaire and loads its questions', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.selectOptions(screen.getByLabelText('Questionnaire'), 'internal-evaluation')
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(texts()[0]).toBe('Is this a real pro')
  })

  it('edits a question and its checkboxes', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const card = screen.getByTestId('question-2')
    const input = within(card).getByLabelText(/^Question \*/)
    await user.clear(input)
    await user.type(input, 'Is it certified?')
    expect(input).toHaveValue('Is it certified?')
    await user.click(within(card).getByRole('checkbox', { name: 'Research needed' }))
    expect(within(card).getByRole('checkbox', { name: 'Research needed' })).toBeChecked()
    const cue = within(card).getByLabelText(/Response cue/)
    await user.clear(cue)
    await user.type(cue, 'Attach the certificate.')
    expect(cue).toHaveValue('Attach the certificate.')
  })

  it('reorders questions with the arrows', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(texts()).toEqual(['Describe the prima', 'Has your organizat', 'Describe how custo'])
    await user.click(screen.getByRole('button', { name: 'Move question 1 down' }))
    expect(texts()).toEqual(['Has your organizat', 'Describe the prima', 'Describe how custo'])
    await user.click(screen.getByRole('button', { name: 'Move question 3 up' }))
    expect(texts()).toEqual(['Has your organizat', 'Describe how custo', 'Describe the prima'])
    expect(screen.getByRole('button', { name: 'Move question 1 up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move question 3 down' })).toBeDisabled()
  })

  it('reorders questions by dragging', () => {
    render(<Harness />)
    const handles = document.querySelectorAll('[draggable="true"]')
    const third = screen.getByTestId('question-3')
    fireEvent.dragStart(handles[0])
    fireEvent.dragOver(third)
    fireEvent.drop(third)
    expect(texts()).toEqual(['Has your organizat', 'Describe how custo', 'Describe the prima'])
    fireEvent.drop(screen.getByTestId('question-1')) // nothing is being dragged
    expect(texts()).toEqual(['Has your organizat', 'Describe how custo', 'Describe the prima'])
  })

  it('deletes a question and says so when none are left', async () => {
    const user = userEvent.setup()
    render(<Harness initial="clinical-safety" />)
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Delete question 1' }))
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(/No questions yet/)).toBeInTheDocument()
  })

  it('adds a question from the popup', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Add question' }))
    const dialog = screen.getByRole('dialog', { name: 'Add new question' })
    await user.type(within(dialog).getByLabelText(/Question text/), 'Which hospitals use it today?')
    await user.type(within(dialog).getByLabelText(/Response cue/), 'Name the sites.')
    await user.click(within(dialog).getByRole('button', { name: 'Save question' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(texts()[3]).toBe('Which hospitals us')

    await user.click(screen.getByRole('button', { name: 'Add question' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Add new question' })).getByRole('button', {
        name: 'Cancel',
      })
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })
})
