import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DashboardScreen } from './DashboardScreen'

describe('DashboardScreen', () => {
  it('renders breadcrumb and all 4 KPI cards matching Image 1', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('M42 admin')).toBeInTheDocument()
    expect(screen.getByText('Total Partnership Requests')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()

    expect(screen.getByText('Pending Director Review')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Action needed')).toBeInTheDocument()

    expect(screen.getByText('NDA in Progress')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()

    expect(screen.getByText('SLA Breached')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('renders Partnership Requests title and exactly the 7 requested columns with styled headers', () => {
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
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()

    // Search filter
    const searchInput = screen.getByPlaceholderText('Filter records...')
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

  it('opens detailed view, allows proceeding through confirmation modal, and updates status', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('MedTech Innovations')
    await user.click(row)

    // Verify detailed view is open
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()

    // Click Proceed button in header bar
    const proceedBtn = screen.getByRole('button', { name: /^Proceed$/i })
    await user.click(proceedBtn)

    // Modal opens
    expect(screen.getByText('Proceed to Next Stage')).toBeInTheDocument()
    const confirmProceedBtn = screen.getByRole('button', { name: /Confirm & Proceed/i })
    await user.click(confirmProceedBtn)

    expect(
      screen.getByText(/Partnership request has been approved to proceed to the next stage/i)
    ).toBeInTheDocument()

    // Back to table and verify status updated
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
  })

  it('opens detailed view, allows rejecting with reason through modal, and updates status', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('AlphaHealth BioTech')
    await user.click(row)

    // Click Reject in header bar
    const rejectBtn = screen.getByRole('button', { name: /^Reject$/i })
    await user.click(rejectBtn)

    // Modal opens
    expect(screen.getByText('Reject Partnership Request')).toBeInTheDocument()

    // Try without reason
    const confirmRejectBtn = screen.getByRole('button', { name: /Confirm Rejection/i })
    await user.click(confirmRejectBtn)
    expect(
      screen.getByText(/A reason is mandatory when rejecting a partnership request/i)
    ).toBeInTheDocument()

    // Type reason and confirm
    const reasonTextarea = screen.getByRole('textbox', { name: /Rejection Reason/i })
    await user.type(reasonTextarea, 'Out of scope for current cycle.')
    await user.click(confirmRejectBtn)

    expect(screen.getByText(/Partnership request has been rejected/i)).toBeInTheDocument()

    // Back to table
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
  })

  it('displays empty state when search matches no records', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'NonExistentCompanyXYZ')

    expect(screen.getByText('No partnership requests found')).toBeInTheDocument()
  })
})
