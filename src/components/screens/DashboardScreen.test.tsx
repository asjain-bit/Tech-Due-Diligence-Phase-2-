import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DashboardScreen } from './DashboardScreen'

describe('DashboardScreen', () => {
  it('renders breadcrumb and all 3 KPI cards with zero metrics', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('M42 admin')).toBeInTheDocument()
    expect(screen.getByText('Total Vendors')).toBeInTheDocument()
    expect(screen.getByText('Average Rounds per Vendor')).toBeInTheDocument()
    expect(screen.getByText('Evidence backlog by age')).toBeInTheDocument()
  })

  it('renders empty table state with appropriate messaging', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('No assessments available')).toBeInTheDocument()
    expect(
      screen.getByText(/There are currently no vendor assessments in this view/i)
    ).toBeInTheDocument()
  })

  it('renders table column headers', () => {
    render(<DashboardScreen />)

    expect(screen.getByRole('columnheader', { name: 'Vendor' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Questionnaire' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Round' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Confidence Level' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Created date' })).toBeInTheDocument()
  })

  it('allows typing into the search bar and switching filter chips', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'Presight')
    expect(searchInput).toHaveValue('Presight')

    const completedChip = screen.getByRole('button', { name: /Completed/i })
    await user.click(completedChip)
    expect(completedChip).toHaveClass('bg-[#36c0c9]')
  })
})
