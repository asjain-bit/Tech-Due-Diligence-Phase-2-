import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { UsageInsightsScreen } from './UsageInsightsScreen'
import { aiCost, DEFAULT_ASSUMPTIONS, manualCost, USAGE_WEEKS } from '@/lib/usageInsights'

describe('usage maths', () => {
  it('reproduces the reference week', () => {
    const week = USAGE_WEEKS[2]
    expect(Math.round(manualCost(week, DEFAULT_ASSUMPTIONS))).toBe(2400)
    expect(Math.round(aiCost(week, DEFAULT_ASSUMPTIONS))).toBe(158)
  })
})

describe('UsageInsightsScreen', () => {
  it('shows the three KPI cards for the selected week', () => {
    render(<UsageInsightsScreen />)
    expect(screen.getByText('Output Generated')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('20 assessment calls')).toBeInTheDocument()
    expect(screen.getByText('18.6M')).toBeInTheDocument()
    expect(screen.getByText('$158')).toBeInTheDocument()
    expect(screen.getByLabelText('Week')).toHaveValue('2')
  })

  it('moves between weeks with the arrows and the selector', async () => {
    const user = userEvent.setup()
    render(<UsageInsightsScreen />)
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByText('22')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Week'), '0')
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous week' })).toBeDisabled()
  })

  it('has the inputs, no Recalculate button, and updates the costs live', async () => {
    const user = userEvent.setup()
    render(<UsageInsightsScreen />)
    expect(screen.queryByRole('button', { name: /Recalculate/i })).not.toBeInTheDocument()
    const hours = screen.getByLabelText(/Hours spent on manual assessments/)
    expect(hours).toHaveValue(4)
    expect(screen.getByLabelText('Cost per hour')).toHaveValue(30)
    await user.click(screen.getByRole('button', { name: 'Summary' }))
    expect(screen.getByText('$2,400')).toBeInTheDocument()
    expect(screen.getByText('15x')).toBeInTheDocument()
    expect(screen.getByText('$2,242')).toBeInTheDocument()
    await user.clear(hours)
    await user.type(hours, '2')
    expect(screen.getByText('$1,200')).toBeInTheDocument()
    expect(screen.getByText('Total hours 40 | Cost per hour $30')).toBeInTheDocument()
  })

  it('switches between the chart and the summary', async () => {
    const user = userEvent.setup()
    render(<UsageInsightsScreen />)
    expect(screen.getByRole('img', { name: /Manual cost versus AI cost/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Summary' }))
    expect(
      screen.queryByRole('img', { name: /Manual cost versus AI cost/ })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Estimated savings')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Chart' }))
    expect(screen.getByRole('img', { name: /Manual cost versus AI cost/ })).toBeInTheDocument()
  })

  it('lists assessments by status and expands with See more', async () => {
    const user = userEvent.setup()
    render(<UsageInsightsScreen />)
    expect(screen.getByRole('heading', { name: 'Assessments by Status' })).toBeInTheDocument()
    const completed = within(screen.getByRole('list', { name: 'Completed' }))
    expect(completed.getAllByRole('listitem')).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: /See more/ }))
    expect(
      within(screen.getByRole('list', { name: 'Scheduled' })).getAllByRole('listitem')
    ).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: /See less/ }))
    expect(
      within(screen.getByRole('list', { name: 'Finalised' })).getAllByRole('listitem')
    ).toHaveLength(4)
  })
})
