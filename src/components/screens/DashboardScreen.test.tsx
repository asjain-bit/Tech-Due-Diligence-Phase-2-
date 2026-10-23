import React, { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { DashboardScreen } from './DashboardScreen'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'

const directorProfile = {
  id: 'director',
  name: 'Zaid Al Ali',
  designation: 'Director',
  email: 'zaid.alali@m42.ae',
  roleTitle: 'Director',
}
const adminProfile = {
  id: 'partnership-admin',
  name: 'Nadia Al-Farsi',
  designation: 'Partnership Admin',
  email: 'nadia.alfarsi@m42.ae',
  roleTitle: 'Partnership Admin',
}

const internalProfile = {
  id: 'evaluator',
  name: 'Mariam Al-Zaabi',
  designation: 'Internal Interest Team',
  email: 'mariam.alzaabi@m42.ae',
  roleTitle: 'Internal Interest Team',
}
const strategyProfile = {
  id: 'strategy-fit',
  name: 'Omar Al-Hashemi',
  designation: 'Strategy Team',
  email: 'omar.alhashemi@m42.ae',
  roleTitle: 'Strategy Team',
}

/** The agent thinks for a few seconds when a case is opened: step through it */
const finishThinking = () => {
  for (let i = 0; i < 8; i++) {
    act(() => {
      vi.advanceTimersByTime(1500)
    })
  }
}

const setup = () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
}

describe('DashboardScreen', () => {
  afterEach(() => vi.useRealTimers())

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

  it('shows the Director the Case ID led table with the new columns', () => {
    render(<DashboardScreen />)

    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual([
      'Case ID',
      'Company',
      'Solution description',
      'Stage',
      'Days in stage',
      'Owner',
      'SLA status',
    ])
    expect(screen.queryByRole('columnheader', { name: 'Request ID' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Vendor Name' })).not.toBeInTheDocument()

    expect(screen.getByText('PR-124')).toBeInTheDocument()
    const row = screen.getByText('MedTech Innovations').closest('tr')!
    expect(row).toHaveTextContent('Screening & Fit')
    expect(row).toHaveTextContent('3 days')
    expect(row).toHaveTextContent('Zaid Al Ali')
    expect(row).toHaveTextContent('On track')
    expect(screen.getByText('At risk')).toBeInTheDocument()
    expect(screen.getByText('Breached')).toBeInTheDocument()
  })

  it('clamps the solution description to two lines and shows the full text in a tooltip', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)
    const full = INITIAL_PARTNERSHIP_REQUESTS[0].assessmentAreas.productPlatformServiceDetails
    const cell = screen.getAllByLabelText(full)[0]
    expect(cell).toHaveClass('line-clamp-2')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await user.hover(cell)
    expect(screen.getByRole('tooltip')).toHaveTextContent(full)
    await user.unhover(cell)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    act(() => cell.focus())
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    act(() => cell.blur())
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('only shows the Director cases the Partnership Admin has sent on', () => {
    render(<DashboardScreen userProfile={directorProfile} />)
    expect(screen.queryByText('NeuroLink Diagnostics')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All requests/ })).toHaveTextContent('4')
    expect(screen.getByRole('button', { name: /Information Requested/ })).toHaveTextContent('0')
  })

  it('shows the Partnership Admin every case, including ones waiting for triage', () => {
    render(<DashboardScreen userProfile={adminProfile} />)
    const row = screen.getByText('NeuroLink Diagnostics').closest('tr')!
    expect(row).toHaveTextContent('PR-125')
    expect(row).toHaveTextContent('Unassigned')
    expect(row).toHaveTextContent('Admin review')
    expect(row).toHaveTextContent('Nadia Al-Farsi')
    expect(screen.getByRole('button', { name: /All requests/ })).toHaveTextContent('5')
  })

  it('searches by Case ID', async () => {
    const user = userEvent.setup()
    render(<DashboardScreen />)
    await user.type(screen.getByPlaceholderText('Search partnership requests...'), 'pr-122')
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()
  })

  it('uses shared cases when given and reports changes', async () => {
    const user = setup()
    const onRequestsChange = vi.fn()
    render(
      <DashboardScreen
        userProfile={adminProfile}
        requests={[INITIAL_PARTNERSHIP_REQUESTS[4]]}
        onRequestsChange={onRequestsChange}
      />
    )
    expect(screen.getByText('NeuroLink Diagnostics')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()

    await user.click(screen.getByText('NeuroLink Diagnostics'))
    finishThinking()
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    await user.type(screen.getByLabelText(/^Reason/), 'Out of scope')
    await user.click(screen.getByRole('button', { name: 'Reject request' }))

    // the agent's own work is logged, then the rejection
    expect(onRequestsChange).toHaveBeenCalledTimes(2)
    const apply = (call: number) =>
      (
        onRequestsChange.mock.calls[call][0] as (
          prev: typeof INITIAL_PARTNERSHIP_REQUESTS
        ) => typeof INITIAL_PARTNERSHIP_REQUESTS
      )([INITIAL_PARTNERSHIP_REQUESTS[4]])[0]
    expect(apply(0).auditLog.at(-1)?.title).toBe('Initial assessment brief generated')
    expect(apply(1)).toMatchObject({ queue: 'closed', status: 'Exited' })
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

  it('opens the case on the thinking animation, then the brief, and navigates back', async () => {
    const user = setup()
    render(<DashboardScreen />)

    await user.click(screen.getByText('MedTech Innovations'))
    expect(screen.getByText('ANALYZING')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Review' })).not.toBeInTheDocument()

    finishThinking()
    expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()

    // No Overview tab: only Review and Audit Log
    expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Review', 'Audit Log'])

    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(screen.getByText('Partnership Requests')).toBeInTheDocument()
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
  })

  it('logs the agent analysis in the case audit log', async () => {
    const user = setup()
    render(<DashboardScreen />)
    await user.click(screen.getByText('MedTech Innovations'))
    finishThinking()
    await user.click(screen.getByRole('tab', { name: 'Audit Log' }))
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    // The seeded case already has its analysis logged, so it is not logged twice
    expect(titles.filter((t) => t === 'Initial assessment brief generated')).toHaveLength(1)
    expect(titles).toContain('Routed as Partnership')
  })

  it('takes a Director through approval, an information request and the Internal Canvas send', async () => {
    const user = setup()
    render(<DashboardScreen userProfile={directorProfile} />)
    await user.click(screen.getByText('MedTech Innovations'))
    finishThinking()

    // Request more info marks the case Information Requested until it is marked as received
    await user.click(screen.getByRole('button', { name: 'Next' }))
    let decision = screen.getByRole('dialog', { name: 'Your decision' })
    await user.selectOptions(within(decision).getByLabelText(/^Decision/), 'Request more info')
    await user.click(within(decision).getByRole('button', { name: 'Mark information requested' }))
    expect(screen.getByText('Information requested: waiting for the vendor')).toBeInTheDocument()
    expect(screen.getAllByText('Information Requested').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Mark info received' }))
    expect(
      screen.queryByText('Information requested: waiting for the vendor')
    ).not.toBeInTheDocument()

    // Approve, then send the Internal Canvas request with its questions
    await user.click(screen.getByRole('button', { name: 'Next' }))
    decision = screen.getByRole('dialog', { name: 'Your decision' })
    await user.selectOptions(within(decision).getByLabelText(/^Decision/), 'Proceed')
    await user.type(within(decision).getByLabelText(/^Reason/), 'Strong fit.')
    await user.click(within(decision).getByRole('button', { name: 'Proceed' }))
    finishThinking()
    expect(screen.getByRole('heading', { level: 2, name: 'Internal Canvas' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    const send = screen.getByRole('dialog', { name: 'Select questionnaire' })
    await user.click(within(send).getByRole('button', { name: 'Next' }))
    await user.click(within(send).getByRole('button', { name: 'Send Request' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Send to Internal Interest?' })).getByRole(
        'button',
        { name: 'Send Request' }
      )
    )
    // The popup closes and the tracking table is shown
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Status' })).toHaveLength(1)

    // The stage now waits for the Internal Interest team, and the next stage stays locked
    expect(
      screen.getByText('Awaiting approval', { selector: 'span.inline-flex' })
    ).toBeInTheDocument()
    const stepper = within(screen.getByRole('navigation', { name: 'Review progress' }))
    expect(stepper.getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()
    await user.click(screen.getByRole('tab', { name: 'Audit Log' }))
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(
      expect.arrayContaining([
        'Request sent to Internal Interest team',
        'Approved to proceed',
        'More information requested',
        'Vendor information received',
      ])
    )
  })

  it('opens the next stage once the Internal Interest team has approved', async () => {
    const user = setup()
    const approved = {
      ...INITIAL_PARTNERSHIP_REQUESTS[0],
      status: 'In Progress' as const,
      decision: { status: 'proceeded' as const, reason: 'ok' },
      sent: { internal: true },
      stageApprovals: {
        internal: { status: 'approved' as const, by: 'Mariam', date: 'Just now' },
      },
    }
    render(<DashboardScreen userProfile={directorProfile} requests={[approved]} />)
    await user.click(screen.getByText('MedTech Innovations'))

    // A case that is already past the brief skips the thinking animation and goes straight to
    // finding the Strategy team for the next stage
    expect(screen.queryByText('ANALYZING')).not.toBeInTheDocument()
    expect(screen.getByText('Finding the Strategy team…')).toBeInTheDocument()
    // The animation takes the whole page: only the tabs stay
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Back to Partnership Requests' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'MedTech Innovations' })).not.toBeInTheDocument()
    finishThinking()
    const stepper = within(screen.getByRole('navigation', { name: 'Review progress' }))
    expect(stepper.getByRole('button', { name: /Internal Canvas/ })).toHaveTextContent('Approved')
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
    expect(screen.getByText('Pre-reads awaiting a decision')).toBeInTheDocument()

    expect(screen.getByText('Verdicts Submitted')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Completed evaluations this month')).toBeInTheDocument()

    expect(screen.getByText('Due Soon')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getByText('Evaluation approaching deadline')).toBeInTheDocument()

    // Vendor Name column should NOT be rendered in outside table
    expect(screen.queryByRole('columnheader', { name: 'Vendor Name' })).not.toBeInTheDocument()
  })

  it('only shows reviewers the cases the Director has sent to their team', () => {
    const { unmount } = render(<DashboardScreen userProfile={internalProfile} />)
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All requests/ })).toHaveTextContent('2')
    unmount()

    const strategyOnly = {
      ...INITIAL_PARTNERSHIP_REQUESTS[0],
      sent: { strategy: true },
    }
    render(
      <DashboardScreen
        userProfile={strategyProfile}
        requests={[INITIAL_PARTNERSHIP_REQUESTS[0], strategyOnly, INITIAL_PARTNERSHIP_REQUESTS[1]]}
      />
    )
    expect(screen.getAllByText('MedTech Innovations')).toHaveLength(1)
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
  })

  it('hides vendor details, the verdict and the Director steps for the internal team', async () => {
    const user = setup()
    render(<DashboardScreen userProfile={internalProfile} />)

    await user.click(screen.getByText('AlphaHealth BioTech'))
    finishThinking()

    expect(screen.queryByText(/Referred by:/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Agent Verdict' })).not.toBeInTheDocument()

    // No workflow stages for this profile
    expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()

    // The brief has no decision form
    expect(screen.getByRole('button', { name: /Continue to Questionnaire/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('radio', { name: /Approve for internal review/i })
    ).not.toBeInTheDocument()
  })

  it('lands the strategy team on the knowledge base, without the brief animation', async () => {
    const user = setup()
    const open = INITIAL_PARTNERSHIP_REQUESTS.map((r) =>
      r.id === 'req-002' ? { ...r, stageApprovals: undefined } : r
    )
    render(<DashboardScreen userProfile={strategyProfile} requests={open} />)

    await user.click(screen.getByText('AlphaHealth BioTech'))
    // No thinking animation and no stepper: straight to the prepare screen
    expect(screen.queryByText('ANALYZING')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Prepare Initial Assessment Brief' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Continue to Knowledge Base/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Skip/i })).not.toBeInTheDocument()
    // The vendor details card stays above it
    expect(screen.getByRole('heading', { name: 'AlphaHealth BioTech' })).toBeInTheDocument()
  })

  it('walks the strategy team through the pre-read and a confirmed decision', async () => {
    const user = setup()
    const open = INITIAL_PARTNERSHIP_REQUESTS.map((r) =>
      r.id === 'req-002' ? { ...r, stageApprovals: undefined } : r
    )
    render(<DashboardScreen userProfile={strategyProfile} requests={open} />)

    await user.click(screen.getByText('AlphaHealth BioTech'))
    await user.upload(screen.getByLabelText('Knowledge base files'), new File(['x'], 'extra.pptx'))
    await user.click(screen.getByRole('button', { name: 'Generate Pre-read Summary' }))

    // The simple animation runs below the vendor details card
    expect(screen.getByText('GENERATING')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'AlphaHealth BioTech' })).toBeInTheDocument()
    finishThinking()

    expect(
      within(screen.getByRole('list', { name: 'Pre-read summary' })).getAllByRole('heading', {
        level: 3,
      })
    ).toHaveLength(6)
    expect(screen.getByText('extra.pptx', { selector: 'span' })).toBeInTheDocument()

    // Fixed bar with Reject and Proceed; both confirm before recording
    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    const popup = screen.getByRole('dialog', { name: 'Proceed with this partnership' })
    await user.click(within(popup).getByRole('button', { name: 'Proceed' }))
    const confirm = screen.getByRole('dialog', { name: 'Submit your decision?' })
    expect(confirm).toHaveTextContent('Proceed')
    await user.click(within(confirm).getByRole('button', { name: 'Submit' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    expect(screen.getByText('Proceeded')).toBeInTheDocument()
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

const sponsorProfile = {
  id: 'sponsor',
  name: 'Rashid Al-Nuaimi',
  designation: 'Sponsor',
  email: 'rashid.alnuaimi@m42.ae',
  roleTitle: 'Sponsor',
}

/** Keeps the cases in state so changes made in the case view show up */
const Shared = ({
  profile,
  initial,
}: {
  profile: typeof directorProfile
  initial: PartnershipRequest[]
}) => {
  const [requests, setRequests] = useState(initial)
  return (
    <DashboardScreen userProfile={profile} requests={requests} onRequestsChange={setRequests} />
  )
}

/** MedTech approved by the Director and sent to the Internal Interest team */
const sentToInternal: PartnershipRequest = {
  ...INITIAL_PARTNERSHIP_REQUESTS[0],
  status: 'In Progress',
  decision: { status: 'proceeded', reason: 'ok' },
  sent: { internal: true },
}

const openCase = async (user: ReturnType<typeof setup>, name = 'MedTech Innovations') => {
  await user.click(screen.getByText(name))
  finishThinking()
}

const simulate = (user: ReturnType<typeof setup>, option: string) =>
  user.selectOptions(screen.getByLabelText(/Simulate the team/), option)

describe('Internal Interest outcomes', () => {
  afterEach(() => vi.useRealTimers())

  it('shows a prototype-only dropdown above the table once the request is sent', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    const select = screen.getByLabelText(/Simulate the team/)
    expect(screen.getAllByRole('option', { name: /./ }).length).toBeGreaterThanOrEqual(5)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'only for prototype functioning and will not be included in the actual developed application'
    )
    expect(
      select.compareDocumentPosition(screen.getByRole('table')) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('closes the case when no one responds', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    await simulate(user, 'none')
    expect(
      screen.getByText('This case was closed: No one from the Internal Interest team responded.')
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/Simulate the team/)).not.toBeInTheDocument()
  })

  it('asks before closing when someone responds but no one is ready to sponsor', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    await simulate(user, 'not-ready')
    const confirm = screen.getByRole('dialog', { name: 'Close this case?' })
    expect(confirm).toHaveTextContent(
      'No one from the Internal Interest team is ready to sponsor this request. Do you want to close this case?'
    )
    expect(screen.getAllByText('Not ready to sponsor').length).toBeGreaterThan(0)
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await simulate(user, 'not-ready')
    await user.click(
      within(screen.getByRole('dialog', { name: 'Close this case?' })).getByRole('button', {
        name: 'Close case',
      })
    )
    expect(
      screen.getByText(
        /This case was closed: No one from the Internal Interest team is ready to sponsor/
      )
    ).toBeInTheDocument()
  })

  it('goes straight to Strategic Alignment when one person is ready to sponsor', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    await simulate(user, 'single')
    expect(screen.getByText('Finding the Strategy team…')).toBeInTheDocument()
    finishThinking()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Strategic Alignment' })
    ).toBeInTheDocument()
    const stepper = within(screen.getByRole('navigation', { name: 'Review progress' }))
    expect(stepper.getByRole('button', { name: /Internal Canvas/ })).toHaveTextContent('Approved')
    // 5 steps in the workflow
    expect(stepper.getAllByRole('button')).toHaveLength(5)
  })

  it('asks the Director to assign the lead and co-sponsors when several are ready', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    await simulate(user, 'multiple')
    const popup = screen.getByRole('dialog', { name: 'Assign sponsors' })
    await user.click(within(popup).getByRole('radio', { name: /Parag Agarwal/ }))
    await user.click(within(popup).getByRole('checkbox', { name: 'Riza Sayeed' }))
    await user.click(within(popup).getByRole('button', { name: 'Assign sponsors' }))
    finishThinking()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Strategic Alignment' })
    ).toBeInTheDocument()
    await user.click(
      within(screen.getByRole('navigation', { name: 'Review progress' })).getByRole('button', {
        name: /Internal Canvas/,
      })
    )
    expect(screen.getByText('Lead sponsor:').parentElement).toHaveTextContent(
      /Lead sponsor: Parag Agarwal.*Co-sponsors: Riza Sayeed/
    )
  })

  it('shows the Strategy Team approval and its conditions as soon as the request is sent', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[sentToInternal]} />)
    await openCase(user)
    await simulate(user, 'single')
    finishThinking()
    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Send Request' })
    )
    expect(screen.getByText('Approval: Proceed')).toBeInTheDocument()
    expect(
      screen.getByText(/Conditions: Proceed on the condition that the vendor commits to UAE/)
    ).toBeInTheDocument()
    const stepper = within(screen.getByRole('navigation', { name: 'Review progress' }))
    expect(stepper.getByRole('button', { name: /Strategic Alignment/ })).toHaveTextContent(
      'Approved'
    )
    expect(stepper.getByRole('button', { name: /NDA & Discovery/ })).toBeEnabled()
  })
})

describe('NDA & Discovery, Value and the Sponsor profile', () => {
  afterEach(() => vi.useRealTimers())

  it('lets the Director upload the signed NDA, which generates the alignment pack', async () => {
    const user = setup()
    render(<Shared profile={directorProfile} initial={[...INITIAL_PARTNERSHIP_REQUESTS]} />)
    await openCase(user, 'AlphaHealth BioTech')
    expect(screen.getByRole('heading', { level: 2, name: 'NDA & Discovery' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Alignment pack' })).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I acknowledge that the document has been signed by the vendor',
      })
    )
    await user.upload(screen.getByLabelText('Upload signed copy'), new File(['x'], 'signed.pdf'))
    expect(screen.getByText(/Signed copy · Version 1/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alignment pack' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Audit Log' }))
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(
      expect.arrayContaining(['Signed NDA uploaded', 'Alignment pack generated'])
    )
  })

  it('shows the Sponsor only the cases they sponsor, with their own KPI cards', () => {
    render(<DashboardScreen userProfile={sponsorProfile} />)
    expect(screen.getByText('AlphaHealth BioTech')).toBeInTheDocument()
    expect(screen.getByText('GenomicX MENA FZ-LLC')).toBeInTheDocument()
    expect(screen.queryByText('MedTech Innovations')).not.toBeInTheDocument()
    expect(screen.getByText('Sponsored Cases')).toBeInTheDocument()
    expect(screen.getByText('Awaiting My Action')).toBeInTheDocument()
    expect(screen.getByText('In Due Diligence')).toBeInTheDocument()
  })

  it('has the Sponsor decide on the business case, then generates the TDD report', async () => {
    const user = setup()
    render(<Shared profile={sponsorProfile} initial={[...INITIAL_PARTNERSHIP_REQUESTS]} />)
    await user.click(screen.getByText('GenomicX MENA FZ-LLC'))
    const stepper = within(screen.getByRole('navigation', { name: 'Review progress' }))
    expect(stepper.getAllByRole('button')).toHaveLength(5)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Value & Due Diligence' })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Proceed' }))
    await user.click(
      within(screen.getByRole('dialog', { name: 'Proceed with this partnership' })).getByRole(
        'button',
        { name: 'Proceed' }
      )
    )
    await user.click(
      within(screen.getByRole('dialog', { name: 'Submit your decision?' })).getByRole('button', {
        name: 'Submit',
      })
    )
    expect(screen.getByText('GENERATING')).toBeInTheDocument()
    finishThinking()
    expect(screen.getByRole('list', { name: 'TDD report' })).toBeInTheDocument()
    expect(stepper.getByRole('button', { name: /Value & Due Diligence/ })).toHaveTextContent(
      'Completed'
    )
  })

  it('shows the Director the earlier stages as read-only for the Sponsor', async () => {
    const user = setup()
    render(<Shared profile={sponsorProfile} initial={[...INITIAL_PARTNERSHIP_REQUESTS]} />)
    await user.click(screen.getByText('GenomicX MENA FZ-LLC'))
    await user.click(
      within(screen.getByRole('navigation', { name: 'Review progress' })).getByRole('button', {
        name: /NDA & Discovery/,
      })
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByText(/Signed copy · Version 1/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Alignment pack' })).toBeInTheDocument()
  })
})
