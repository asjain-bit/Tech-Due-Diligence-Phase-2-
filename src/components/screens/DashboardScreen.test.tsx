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
    expect(screen.getByText('Require Director Action')).toBeInTheDocument()

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

    expect(screen.getByRole('columnheader', { name: 'Request ID' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Company name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Vendor Name' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Referred by' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('columnheader', { name: (content) => content === 'Solution' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Focus Area' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Solution Maturity' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Deadline' })).toBeInTheDocument()

    // Request ID leads, Submitted Date closes
    const headers = screen.getAllByRole('columnheader')
    expect(headers[0]).toHaveTextContent('Request ID')
    expect(headers[headers.length - 1]).toHaveTextContent('Submitted Date')
    expect(screen.getByText('PR-124')).toBeInTheDocument()
    expect(screen.getByText('PR-121')).toBeInTheDocument()
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

  it('opens the detailed view on the agent run and navigates back to the list', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)

    await user.click(screen.getByText('MedTech Innovations'))

    // Opens on the review workflow, with the agent run in progress
    expect(screen.getByRole('heading', { name: 'Agent Actions' })).toBeInTheDocument()

    // Overview tab keeps workflow progress and the agent recommendation chip
    await user.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText(/High Confidence/i)).toBeInTheDocument()

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

    expect(screen.getByText('Pending Review')).toBeInTheDocument()
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
    expect(screen.queryByRole('columnheader', { name: 'Solution' })).not.toBeInTheDocument()
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

  it('hides vendor details and the Director steps for the internal team', async () => {
    const user = userEvent.setup()
    const internalProfile = {
      id: 'evaluator',
      name: 'Mariam Al-Zaabi',
      designation: 'Internal Interest Team',
      email: 'mariam.alzaabi@m42.ae',
      roleTitle: 'Internal Interest Team',
    }
    render(<DashboardScreen userProfile={internalProfile} />)

    await user.click(screen.getByText('MedTech Innovations'))

    expect(screen.queryByText(/Referred by:/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Internal Review/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Approval/i })).not.toBeInTheDocument()

    // Steps for this profile: Agent Actions, Brief, Questionnaire
    const stepper = screen.getByRole('navigation', { name: 'Review progress' })
    expect(stepper).toHaveTextContent('Agent Actions')
    expect(stepper).toHaveTextContent('Initial Assessment Brief')
    expect(stepper).toHaveTextContent('Questionnaire')

    // The brief has no Proceed, Reject or decision form
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(
      await screen.findByRole('button', { name: /Continue to Questionnaire/i }, { timeout: 3000 })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Proceed/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reject/i })).not.toBeInTheDocument()
  })

  it('walks the strategy team through the agent run, brief and judgement', async () => {
    const user = userEvent.setup()
    const strategyProfile = {
      id: 'strategy-fit',
      name: 'Omar Al-Hashemi',
      designation: 'Strategy Team',
      email: 'omar.alhashemi@m42.ae',
      roleTitle: 'Strategy Team',
    }
    render(<DashboardScreen userProfile={strategyProfile} />)

    await user.click(screen.getByText('MedTech Innovations'))
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    await user.click(
      await screen.findByRole('button', { name: /Continue to Judgement/i }, { timeout: 3000 })
    )

    expect(screen.getByRole('heading', { name: 'Your judgement' })).toBeInTheDocument()
    expect(screen.getByText('Fit to current focus areas')).toBeInTheDocument()
    expect(screen.getByText('Sovereignty and local content')).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: /^Save$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Cancel$/i })).not.toBeInTheDocument()
    const submitBtn = screen.getByRole('button', { name: /Submit decision/i })
    expect(submitBtn).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: /Yes, proceed/i }))
    expect(submitBtn).toBeEnabled()
    await user.click(submitBtn)

    expect(screen.getByText('Submit Strategy Decision')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm & Submit' }))

    expect(screen.queryByText('Submit Strategy Decision')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
    screen.getAllByRole('combobox').forEach((c) => expect(c).toBeDisabled())
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
})
