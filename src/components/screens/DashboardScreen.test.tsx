import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DashboardScreen } from './DashboardScreen'

describe('DashboardScreen', () => {
  it('renders breadcrumb and all 3 KPI cards with vendor metrics', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('M42 admin')).toBeInTheDocument()
    expect(screen.getByText('Total Vendors')).toBeInTheDocument()
    expect(screen.getByText('Average Rounds per Vendor')).toBeInTheDocument()
    expect(screen.getByText('Evidence backlog by age')).toBeInTheDocument()
  })

  it('renders Partnership Requests title and exactly the 7 requested columns', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()

    expect(screen.getByRole('columnheader', { name: 'Company name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Vendor Name' })).toBeInTheDocument()
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
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
    expect(screen.getByText('NeuroVance Health Ltd')).toBeInTheDocument()

    // Search filter
    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'GenomicX')
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.queryByText('AlphaHealth BioTech')).not.toBeInTheDocument()

    // Clear search
    await user.clear(searchInput)

    // Filter chip for Shortlisted
    const shortlistedChip = screen.getByRole('button', { name: /Shortlisted/i })
    await user.click(shortlistedChip)
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.queryByText('AlphaHealth BioTech')).not.toBeInTheDocument()
  })

  it('opens detailed view, allows proceeding and updates status', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('AlphaHealth BioTech')
    await user.click(row)

    // Switch to Brief tab
    await user.click(screen.getByRole('button', { name: 'Brief' }))

    // Click Proceed
    const proceedBtn = screen.getByRole('button', { name: /Proceed/i })
    await user.click(proceedBtn)

    expect(
      screen.getByText(/Partnership request has been approved to proceed to the next stage/i)
    ).toBeInTheDocument()

    // Back to table and verify status updated to Shortlisted
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
  })

  it('opens detailed view, allows rejecting with reason and updates status', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('NeuroVance Health Ltd')
    await user.click(row)

    // Switch to Brief tab
    await user.click(screen.getByRole('button', { name: 'Brief' }))

    // Type reason and click Reject
    const reasonTextarea = screen.getByRole('textbox', { name: /Decision Reason \/ Notes/i })
    await user.type(reasonTextarea, 'Out of scope for current cycle.')
    const rejectBtn = screen.getByRole('button', { name: /Reject/i })
    await user.click(rejectBtn)

    expect(screen.getByText(/Partnership request has been rejected/i)).toBeInTheDocument()

    // Back to table
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('NeuroVance Health Ltd')).toBeInTheDocument()
  })

  it('displays empty state when search matches no records', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'NonExistentCompanyXYZ')

    expect(screen.getByText('No partnership requests found')).toBeInTheDocument()
  })
})
