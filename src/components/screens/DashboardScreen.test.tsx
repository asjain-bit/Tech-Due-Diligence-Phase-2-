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

    // 4 KPI Cards (Updated Titles)
    expect(screen.getByText('Total Request')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('+1 this month ↗')).toBeInTheDocument()

    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Require PMO action')).toBeInTheDocument()

    expect(screen.getByText('NDA in Progress')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Needs monitoring')).toBeInTheDocument()

    expect(screen.getByText('EXITED BEFORE REVIEW')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Filtered out during initial agent screening')).toBeInTheDocument()
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
    expect(screen.getByRole('columnheader', { name: 'Deadline' })).toBeInTheDocument()
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

    // Filter chip for In Progress
    const inProgressChip = screen.getByRole('button', { name: /In Progress/i })
    await user.click(inProgressChip)
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()
  })

  it('opens detailed view and navigates back to list', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    const row = screen.getByText('MedTech Innovations')
    await user.click(row)

    // Verify detailed view is open with single large white card containing Workflow Progress and Agent Recommendation chip
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText(/Proceed/i)).toBeInTheDocument()
    expect(screen.getByText(/High Confidence/i)).toBeInTheDocument()

    // Back to table
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
  })

  it('renders Internal Interest Team KPI cards and excludes Vendor Name column', () => {
    const internalProfile = {
      id: 'evaluator',
      name: 'Mariam Al-Zaabi',
      designation: 'Internal Interest Team',
      email: 'mariam.alzaabi@m42.ae',
      roleTitle: 'Internal Interest Team',
    }
    render(<DashboardScreen userProfile={internalProfile} />)

    // 4 KPI Cards for Internal Interest Team (Image 1)
    expect(screen.getByText('Assigned to Me')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Partnerships requiring my review')).toBeInTheDocument()

    expect(screen.getByText('Pending My Review')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Questionnaire not submitted')).toBeInTheDocument()

    expect(screen.getByText('Completed Reviews')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    expect(screen.getByText('Verdicts submitted this month')).toBeInTheDocument()

    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getByText('Reviews past their deadline')).toBeInTheDocument()

    // Vendor Name column should NOT be rendered in outside table
    expect(screen.queryByRole('columnheader', { name: 'Vendor Name' })).not.toBeInTheDocument()
    // Other columns remain
    expect(screen.getByRole('columnheader', { name: 'Company name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Solution' })).toBeInTheDocument()
  })

  it('renders Strategy Team KPI cards and excludes Vendor Name column', () => {
    const strategyProfile = {
      id: 'strategy-fit',
      name: 'Omar Al-Hashemi',
      designation: 'Strategy Team',
      email: 'omar.alhashemi@m42.ae',
      roleTitle: 'Strategy Team',
    }
    render(<DashboardScreen userProfile={strategyProfile} />)

    // 4 KPI Cards for Strategy Team (Image 2)
    expect(screen.getByText('Assigned Evaluations')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Requests assigned to me')).toBeInTheDocument()

    expect(screen.getByText('Pending Evaluation')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    expect(screen.getByText('Judgement criteria awaiting review')).toBeInTheDocument()

    expect(screen.getByText('Verdicts Submitted')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Completed evaluations this month')).toBeInTheDocument()

    expect(screen.getByText('Due Soon')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getByText('Evaluation approaching deadline')).toBeInTheDocument()

    // Vendor Name column should NOT be rendered in outside table
    expect(screen.queryByRole('columnheader', { name: 'Vendor Name' })).not.toBeInTheDocument()
  })

  it('hides vendor details, referred by, and internal review tab in detailed view for internal/strategy team', async () => {
    const user = userEvent.setup()
    const internalProfile = {
      id: 'evaluator',
      name: 'Mariam Al-Zaabi',
      designation: 'Internal Interest Team',
      email: 'mariam.alzaabi@m42.ae',
      roleTitle: 'Internal Interest Team',
    }
    render(<DashboardScreen userProfile={internalProfile} />)

    const row = screen.getByText('MedTech Innovations')
    await user.click(row)

    // Should not show Referred by or Internal Review tab
    expect(screen.queryByText(/Referred by:/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Internal Review/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Internal Review/i })).not.toBeInTheDocument()

    // Should show Questionnaire tab for Internal Interest Team
    expect(screen.getByRole('tab', { name: /Questionnaire/i })).toBeInTheDocument()

    // Brief tab should not have Proceed or Reject buttons
    const briefTab = screen.getByRole('tab', { name: /Partnership Brief/i })
    await user.click(briefTab)
    expect(screen.queryByRole('button', { name: /Proceed/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument()
  })

  it('does not display Exited status or Exited filter chip to internal and strategy teams', () => {
    const internalProfile = {
      id: 'evaluator',
      name: 'Mariam Al-Zaabi',
      designation: 'Internal Interest Team',
      email: 'mariam.alzaabi@m42.ae',
      roleTitle: 'Internal Interest Team',
    }
    render(<DashboardScreen userProfile={internalProfile} />)

    // Exited filter chip should not be present
    expect(screen.queryByRole('button', { name: /^Exited/i })).not.toBeInTheDocument()
  })

  it('renders Judgement tab for strategy team with 7 questions and confirmation popup', async () => {
    const user = userEvent.setup()
    const strategyProfile = {
      id: 'strategy-fit',
      name: 'Omar Al-Hashemi',
      designation: 'Strategy Team',
      email: 'omar.alhashemi@m42.ae',
      roleTitle: 'Strategy Team',
    }
    render(<DashboardScreen userProfile={strategyProfile} />)

    const row = screen.getByText('MedTech Innovations')
    await user.click(row)

    // Verify Judgement tab exists for Strategy Team
    const judgementTab = screen.getByRole('tab', { name: /Judgement/i })
    expect(judgementTab).toBeInTheDocument()
    await user.click(judgementTab)

    // Verify header and criteria questions
    expect(screen.getByText('Your judgement')).toBeInTheDocument()
    expect(screen.getByText('Fit to current focus areas')).toBeInTheDocument()
    expect(screen.getByText('Duplication on the roadmap')).toBeInTheDocument()
    expect(screen.getByText('Build, buy or partner')).toBeInTheDocument()
    expect(screen.getByText('Architecture, hosting and data residency')).toBeInTheDocument()
    expect(screen.getByText('Own versus rent')).toBeInTheDocument()
    expect(screen.getByText('Scale across the network')).toBeInTheDocument()
    expect(screen.getByText('Sovereignty and local content')).toBeInTheDocument()

    // Click Save to open Final Recommendation popup
    const saveJudgementBtn = screen.getByRole('button', { name: /^Save$/i })
    await user.click(saveJudgementBtn)

    // Select Proceed outcome in the popup
    const proceedBtn = screen.getByRole('button', { name: /^Proceed$/i })
    await user.click(proceedBtn)

    // Submit Judgement button in popup
    const submitBtn = screen.getByRole('button', { name: 'Submit Judgement' })
    await user.click(submitBtn)

    // Verify confirmation modal
    expect(screen.getByText('Submit Strategy Judgement')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to send this judgement for Director Review?')
    ).toBeInTheDocument()

    // Confirm submission
    const confirmBtn = screen.getByRole('button', { name: 'Confirm & Submit' })
    await user.click(confirmBtn)

    // Modal closes and becomes view only
    expect(screen.queryByText('Submit Strategy Judgement')).not.toBeInTheDocument()
    expect(screen.getByText(/Strategy Judgement Submitted to Director Review/i)).toBeInTheDocument()
    expect(screen.getByText('View Only')).toBeInTheDocument()
  })
})
