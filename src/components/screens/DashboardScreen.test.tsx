import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DashboardScreen } from './DashboardScreen'

describe('DashboardScreen', () => {
  it('renders all 4 KPI cards matching Image 2 design without breadcrumb', () => {
    render(<DashboardScreen />)

    // Breadcrumb removed
    expect(screen.queryByText('M42 admin')).not.toBeInTheDocument()

    // 4 KPI Cards
    expect(screen.getByText('Total Partnership Requests')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('+1 this month ↗')).toBeInTheDocument()

    expect(screen.getByText('Pending Director Review')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Require PMO action')).toBeInTheDocument()

    expect(screen.getByText('NDA in Progress')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Needs monitoring')).toBeInTheDocument()

    expect(screen.getByText('SLA Breached')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Across active projects')).toBeInTheDocument()
  })

  it('renders Partnership Requests title and table columns without Referred by', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()

    expect(screen.getByRole('columnheader', { name: 'Company name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Vendor Name' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Referred by' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: (content) => content === 'Solution' })
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Focus Area' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Solution Maturity' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Submitted on' })).toBeInTheDocument()
  })

  it('filters records via search bar and filter chips', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    // Table rows
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()

    // Search filter without search button
    const searchInput = screen.getByPlaceholderText('Search partnership requests...')
    await user.type(searchInput, 'CarePulse')
    expect(screen.getByText('CarePulse Technologies')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()

    // Clear search
    await user.clear(searchInput)

    // Filter chip for Shortlisted
    const shortlistedChip = screen.getByRole('button', { name: /Shortlisted/i })
    await user.click(shortlistedChip)
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()
  })

  it('opens detailed view and navigates back to list', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('MedTech Innovations')
    await user.click(row)

    // Verify detailed view is open with single large white card containing Workflow Progress and Agent Recommendation chip
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText(/Recommended to Proceed/i)).toBeInTheDocument()

    // Back to table
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
  })
})
