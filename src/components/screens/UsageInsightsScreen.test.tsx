import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'
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

  it('lets only the Partnership Admin recalculate, using the inputs they set', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<UsageInsightsScreen />)
    // Everyone else sees the inputs, read-only, and no Recalculate button
    expect(screen.queryByRole('button', { name: /Recalculate/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Hours spent on manual assessments/)).toBeDisabled()
    unmount()

    render(<UsageInsightsScreen canRecalculate />)
    const hours = screen.getByLabelText(/Hours spent on manual assessments/)
    expect(hours).toHaveValue(4)
    expect(screen.getByLabelText('Cost per hour')).toHaveValue(30)
    await user.click(screen.getByRole('button', { name: 'Summary' }))
    expect(screen.getByText('$2,400')).toBeInTheDocument()
    expect(screen.getByText('15x')).toBeInTheDocument()
    expect(screen.getByText('$2,242')).toBeInTheDocument()
    await user.clear(hours)
    await user.type(hours, '2')
    // Nothing changes until Recalculate
    expect(screen.getByText('$2,400')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Recalculate/i }))
    expect(screen.getByText('$1,200')).toBeInTheDocument()
    expect(screen.getByText('Total hours 40 | Cost per hour $30')).toBeInTheDocument()
    expect(screen.getByText(/Last recalculated/)).toBeInTheDocument()
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

  it('lists the cases as Completed, In Progress and Closed, with their workflow stage', async () => {
    const user = userEvent.setup()
    const base = INITIAL_PARTNERSHIP_REQUESTS[2]
    const cases = [
      { ...base, id: 'a', companyName: 'Done Co', value: { tddGeneratedOn: 'x' } },
      ...Array.from({ length: 5 }, (_, i) => ({ ...base, id: `p${i}`, companyName: `Live ${i}` })),
      { ...base, id: 'c', companyName: 'Ended Co', status: 'Closed' as const },
    ]
    render(<UsageInsightsScreen requests={cases} />)
    expect(screen.getByRole('heading', { name: 'Assessments by Status' })).toBeInTheDocument()
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
      .filter((t) => ['Completed', 'In Progress', 'Closed'].includes(t ?? ''))
    expect(titles).toEqual(['Completed', 'In Progress', 'Closed'])
    expect(
      within(screen.getByRole('list', { name: 'Completed' })).getByText('Done Co')
    ).toBeVisible()
    expect(within(screen.getByRole('list', { name: 'Closed' })).getByText('Closed')).toBeVisible()
    expect(
      within(screen.getByRole('list', { name: 'In Progress' })).getAllByRole('listitem')
    ).toHaveLength(4)
    await user.click(screen.getByRole('button', { name: /See more/ }))
    expect(
      within(screen.getByRole('list', { name: 'In Progress' })).getAllByRole('listitem')
    ).toHaveLength(5)
  })
})
