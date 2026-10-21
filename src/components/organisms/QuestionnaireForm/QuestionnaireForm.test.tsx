import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QuestionnaireForm } from './QuestionnaireForm'
import type { QuestionnaireValues } from './QuestionnaireForm.types'

const values: QuestionnaireValues = {
  problem: 'Late recognition',
  kpi: 'ICU sepsis mortality',
  baseline: '21%',
  change: '3 points',
  sponsor: 'No',
  budget: "Don't know",
  sayNo: '',
}

describe('QuestionnaireForm', () => {
  it('reports edits through onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<QuestionnaireForm values={values} onChange={onChange} />)

    await user.type(screen.getByLabelText('Baseline today'), '5')
    expect(onChange).toHaveBeenCalledWith({ baseline: '21%5' })

    await user.click(screen.getByRole('radio', { name: 'Not sure yet' }))
    expect(onChange).toHaveBeenCalledWith({ sponsor: 'Not sure yet' })

    await user.selectOptions(screen.getByLabelText('KPI'), 'Bed occupancy rate')
    expect(onChange).toHaveBeenCalledWith({ kpi: 'Bed occupancy rate' })
  })

  it('shows required progress and only enables Submit when all required answers exist', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { rerender } = render(<QuestionnaireForm values={values} onSubmit={onSubmit} />)
    expect(screen.getByText('6 of 6 required answered')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onSubmit).toHaveBeenCalled()

    rerender(<QuestionnaireForm values={{ ...values, problem: '' }} onSubmit={onSubmit} />)
    expect(screen.getByText('5 of 6 required answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
  })

  it('calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<QuestionnaireForm values={values} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('keeps the same layout but locks everything when readOnly', () => {
    render(<QuestionnaireForm values={values} readOnly />)
    expect(screen.getByLabelText('Baseline today')).toBeDisabled()
    expect(screen.getByLabelText('KPI')).toBeDisabled()
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled())
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No', checked: true })).toBeInTheDocument()
  })
})
