import React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { VendorWebForm } from './VendorWebForm'

const fill = (label: RegExp | string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const fillRequired = async (user: ReturnType<typeof userEvent.setup>) => {
  fill(/^Name/, 'Dr. Omar Rahman')
  fill(/^Job Title/, 'CEO')
  fill(/^Company/, 'PulseAI Health')
  fill(/^Email Address/, 'omar@pulseai.health')
  fill(/^Year Company/, '2021')
  fill(
    /stage of maturity and experience/i,
    'We are a young company with some experience in healthcare AI.'
  )
  fill(/proposal of collaboration/i, 'Deploy our triage model in M42 emergency departments.')
  fill(/current maturity level of your solution/i, 'Pilot stage.')
  fill(/relevant approvals/i, 'In progress')
  fill(/novel or differentiated/i, 'Our model is better than others.')
  fill(/specific resources, input/i, 'Support from M42.')
  await user.click(screen.getByLabelText(/Which Focus Area/))
  await user.click(screen.getByRole('button', { name: 'AI & Diagnostics' }))
}

describe('VendorWebForm', () => {
  afterEach(() => vi.useRealTimers())

  it('shows every field of the vendor submission form', () => {
    render(<VendorWebForm onSubmitCase={vi.fn()} onSignOut={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Partnership request form' })).toBeInTheDocument()
    ;[
      /^Name/,
      /^Job Title/,
      /^Company \*/,
      /^Phone Number/,
      /^Email Address/,
      /^Year Company/,
    ].forEach((label) => expect(screen.getByLabelText(label)).toBeInTheDocument())
    ;[
      /stage of maturity and experience/i,
      /proposal of collaboration/i,
      /Which Focus Area does your solution address/i,
      /current maturity level of your solution/i,
      /relevant approvals/i,
      /novel or differentiated/i,
      /developed entirely by your team/i,
      /specific resources, input/i,
      /patient populations, clinical areas/i,
    ].forEach((q) => expect(screen.getAllByText(q).length).toBeGreaterThan(0))
    expect(screen.getByRole('group', { name: 'Patient populations' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Run AI check/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit request/i })).toBeInTheDocument()
  })

  it('does not submit while required fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmitCase = vi.fn()
    render(<VendorWebForm onSubmitCase={onSubmitCase} />)
    await user.click(screen.getByRole('button', { name: /Submit request/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Please fill in the required fields')
    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(5)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onSubmitCase).not.toHaveBeenCalled()
  })

  it('selects several focus areas from the dropdown', async () => {
    const user = userEvent.setup()
    render(<VendorWebForm onSubmitCase={vi.fn()} />)
    const trigger = screen.getByLabelText(/Which Focus Area/)
    expect(trigger).toHaveTextContent('Select focus areas')
    await user.click(trigger)
    const list = screen.getByRole('listbox', { name: 'Focus areas' })
    await user.click(within(list).getByRole('button', { name: 'AI & Diagnostics' }))
    await user.click(within(list).getByRole('button', { name: 'Medical Imaging' }))
    expect(trigger).toHaveTextContent('AI & Diagnostics')
    expect(trigger).toHaveTextContent('Medical Imaging')
    await user.click(within(list).getByRole('button', { name: 'AI & Diagnostics' }))
    expect(trigger).not.toHaveTextContent('AI & Diagnostics')
  })

  it('runs an AI check that suggests more detail, which can be ignored or left', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<VendorWebForm onSubmitCase={vi.fn()} />)
    await fillRequired(user)

    await user.click(screen.getByRole('button', { name: /Run AI check/i }))
    expect(screen.getByRole('button', { name: /Checking your answers/i })).toBeDisabled()
    act(() => {
      vi.advanceTimersByTime(1700)
    })

    expect(screen.getByRole('status')).toHaveTextContent('AI check found 7 suggestions')
    const notes = screen.getAllByRole('note')
    expect(notes.length).toBe(7)
    expect(
      screen.getByText(/Add milestones|Add milestones with years|This feels brief/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Run AI check again/i })).toBeInTheDocument()

    await user.click(within(notes[0]).getByRole('button', { name: 'Ignore' }))
    expect(screen.getAllByRole('note').length).toBe(6)
    expect(screen.getByRole('status')).toHaveTextContent('AI check found 6 suggestions')
  })

  it('reports when the AI check finds nothing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<VendorWebForm onSubmitCase={vi.fn()} />)
    await fillRequired(user)
    fill(
      /stage of maturity and experience/i,
      'Founded in 2018, we launched our platform in 2022 and expanded to the UAE in 2023 through a partnership with two hospital groups serving over 30 clinicians.'
    )
    fill(
      /proposal of collaboration/i,
      'We propose to deploy our diagnostic platform across three M42 hospitals over the next twelve months, starting with radiology and then expanding to oncology.'
    )
    fill(
      /current maturity level of your solution/i,
      'The platform is in pilot with three hospitals and holds CE Mark and FDA clearance, with a DoH Abu Dhabi submission under way.'
    )
    fill(/relevant approvals/i, 'CE, FDA')
    fill(
      /novel or differentiated/i,
      'Our model reaches 96% sensitivity in a peer-reviewed study of 20,000 scans and holds two granted patents on its architecture and training method.'
    )
    fill(
      /specific resources, input/i,
      'We would like access to de-identified imaging data, two pilot sites and integration support with the EHR.'
    )
    await user.click(screen.getByRole('checkbox', { name: 'Adult patients' }))

    await user.click(screen.getByRole('button', { name: /Run AI check/i }))
    act(() => {
      vi.advanceTimersByTime(1700)
    })
    expect(screen.getByRole('status')).toHaveTextContent('AI check found nothing to improve')
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('asks for confirmation, captures the response and gives a case ID', async () => {
    const user = userEvent.setup()
    const onSubmitCase = vi.fn().mockReturnValue('PR-126')
    render(<VendorWebForm onSubmitCase={onSubmitCase} />)
    await fillRequired(user)

    await user.click(screen.getByRole('button', { name: /Submit request/i }))
    const dialog = screen.getByRole('dialog', { name: /Submit your request/i })
    expect(dialog).toHaveTextContent('You will not be able to edit them after submitting')
    expect(onSubmitCase).not.toHaveBeenCalled()

    // going back keeps the answers
    await user.click(screen.getByRole('button', { name: 'Review again' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Company \*/)).toHaveValue('PulseAI Health')

    await user.click(screen.getByRole('button', { name: /Submit request/i }))
    await user.click(screen.getByRole('button', { name: /Confirm & submit/i }))
    expect(onSubmitCase).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'PulseAI Health',
        email: 'omar@pulseai.health',
        focusAreas: ['AI & Diagnostics'],
      })
    )
    expect(screen.getByRole('heading', { name: 'Request submitted' })).toBeInTheDocument()
    expect(screen.getByText('PR-126')).toBeInTheDocument()
    expect(screen.getByText('Your case ID')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Submit another request/i }))
    expect(screen.getByRole('heading', { name: 'Partnership request form' })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Company \*/)).toHaveValue('')
  })

  it('mentions open AI suggestions in the confirmation and can be closed with the X', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<VendorWebForm onSubmitCase={vi.fn()} />)
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: /Run AI check/i }))
    act(() => {
      vi.advanceTimersByTime(1700)
    })
    await user.click(screen.getByRole('button', { name: /Submit request/i }))
    expect(screen.getByRole('dialog')).toHaveTextContent('7 AI suggestions are still open')
    await user.click(screen.getByRole('button', { name: 'Close confirmation' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('signs out', async () => {
    const user = userEvent.setup()
    const onSignOut = vi.fn()
    render(<VendorWebForm onSubmitCase={vi.fn()} onSignOut={onSignOut} />)
    await user.click(screen.getByRole('button', { name: /Sign out/i }))
    expect(onSignOut).toHaveBeenCalled()
  })
})
