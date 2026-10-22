import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { PartnershipDetail } from './PartnershipDetail'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const profile = (id: string, roleTitle: string) => ({
  id,
  name: roleTitle,
  designation: roleTitle,
  email: `${id}@m42.ae`,
  roleTitle,
})
const internalProfile = profile('evaluator', 'Internal Interest Team')
const strategyProfile = profile('strategy-fit', 'Strategy Team')
const adminProfile = profile('partnership-admin', 'Partnership Admin')

type User = ReturnType<typeof userEvent.setup>

describe('PartnershipDetail', () => {
  const mockRequest = INITIAL_PARTNERSHIP_REQUESTS[0]
  const onBack = vi.fn()
  const onProceed = vi.fn()
  const onReject = vi.fn()
  const onRequestInfo = vi.fn()
  const onResume = vi.fn()
  const onRoute = vi.fn()

  const renderDetail = (props: Partial<React.ComponentProps<typeof PartnershipDetail>> = {}) =>
    render(
      <PartnershipDetail
        request={mockRequest}
        allRequests={INITIAL_PARTNERSHIP_REQUESTS}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
        onRequestInfo={onRequestInfo}
        onResume={onResume}
        onRoute={onRoute}
        animateAgentRun={false}
        {...props}
      />
    )

  /** Timers inside the animations are scheduled after each render, so step through them */
  const runTimers = (seconds: number) => {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }
  }

  const stepper = () => within(screen.getByRole('navigation', { name: 'Review progress' }))

  /** Director approves the brief, so Strategic Alignment opens */
  const approveBrief = async (user: User) => {
    await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
    await user.type(screen.getByLabelText(/^Reason/), 'Strong evidence')
    await user.click(screen.getByRole('button', { name: /Submit decision/i }))
  }

  /** Open the send dialog from the step header and confirm it */
  const sendRequest = async (user: User) => {
    await user.click(screen.getByRole('button', { name: 'Send Request' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Send Request' }))
  }

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('page layout', () => {
    it('shows the tabs directly under the back link, above the header card', () => {
      renderDetail()
      const back = screen.getByRole('button', { name: 'Back to Partnership Requests' })
      const tabs = screen.getByRole('tablist')
      const title = screen.getByRole('heading', { name: 'MedTech Innovations' })
      expect(back.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(tabs.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Overview', 'Review'])
    })

    it('renders the header card with contact details for the Director', () => {
      renderDetail()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getAllByText('Sarah Ahmed').length).toBeGreaterThan(0)
      expect(screen.getAllByText('sarah@medtechinnovations.com').length).toBeGreaterThan(0)
      expect(screen.getAllByText('+971 50 123 4567').length).toBeGreaterThan(0)
      expect(screen.getByText('Founded in 2018')).toBeInTheDocument()
      expect(screen.getByText('Referred by:')).toBeInTheDocument()
    })

    it('keeps the Overview tab with workflow progress and key information', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('tab', { name: 'Overview' }))
      expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
      expect(screen.getByText(/Agent Recommendation:/i)).toBeInTheDocument()
      expect(screen.getByText(/High Confidence/i)).toBeInTheDocument()
      expect(screen.getByText('Solution Overview')).toBeInTheDocument()
      expect(screen.getByText('Key Information')).toBeInTheDocument()
    })

    it('triggers onBack', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
      expect(onBack).toHaveBeenCalled()
    })
  })

  describe('agent run inside the brief step', () => {
    it('plays the checks first, keeps later steps locked, then shows the brief', () => {
      vi.useFakeTimers()
      renderDetail({ animateAgentRun: true })

      expect(screen.getByRole('heading', { name: 'Agent Actions' })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Agent progress' })).toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: 'Initial Assessment Brief' })
      ).not.toBeInTheDocument()

      // The stepper has no separate Agent Actions step; later steps are locked
      expect(stepper().queryByRole('button', { name: /Agent Actions/ })).not.toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()
      expect(stepper().getByRole('button', { name: /Internal Canvas/ })).toBeDisabled()
      expect(stepper().getByRole('button', { name: /Approval/ })).toBeDisabled()

      runTimers(12)
      expect(screen.getByText(/Analysis complete/)).toBeInTheDocument()
      runTimers(2)
      expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
      expect(screen.getByText('AI analysis completed')).toBeInTheDocument()
    })

    it('can be skipped', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ animateAgentRun: true })
      await user.click(screen.getByRole('button', { name: 'Skip' }))
      runTimers(2)
      expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
    })
  })

  describe('Director: Initial Assessment Brief', () => {
    it('shows the brief with a side panel, the AI analysis banner and the decision', () => {
      renderDetail()
      expect(stepper().getByRole('button', { name: /Initial Assessment Brief/ })).toHaveAttribute(
        'aria-current',
        'step'
      )
      expect(screen.getByText('To review')).toBeInTheDocument()
      const nav = within(screen.getByRole('navigation', { name: 'Brief sections' }))
      expect(nav.getByRole('button', { name: 'Company Information' })).toBeInTheDocument()
      expect(nav.getByRole('button', { name: 'Your Decision' })).toBeInTheDocument()
      expect(screen.getByText('Recommends proceeding')).toBeInTheDocument()
      expect(screen.getByText('High confidence')).toBeInTheDocument()
      expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    })

    it('opens the AI analysis in a side drawer', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: /View checks and findings/i }))
      const drawer = screen.getByRole('dialog', { name: 'AI analysis details' })
      expect(within(drawer).getByText('Duplicate check')).toBeInTheDocument()
      expect(within(drawer).getByText('Commodity test')).toBeInTheDocument()
      expect(within(drawer).queryByText('Passed')).not.toBeInTheDocument()
      await user.click(within(drawer).getByRole('button', { name: 'Close AI analysis' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('opens the vendor response with the eye icon button', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: /View vendor response/i }))
      const dialog = screen.getByRole('dialog', { name: /Vendor Submission/i })
      expect(within(dialog).getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Close' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('requires a reason before approving, then opens Strategic Alignment', async () => {
      const user = userEvent.setup()
      renderDetail()
      const submit = screen.getByRole('button', { name: /Submit decision/i })
      expect(submit).toBeDisabled()
      await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
      expect(submit).toBeDisabled()
      await user.type(screen.getByLabelText(/^Reason/), 'Strong evidence')
      expect(submit).toBeEnabled()
      await user.click(submit)

      expect(onProceed).toHaveBeenCalledWith(mockRequest.id, 'Strong evidence')
      expect(
        screen.getByRole('heading', { level: 2, name: 'Strategic Alignment' })
      ).toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Initial Assessment Brief/ })).toBeEnabled()
    })

    it('records a rejection and closes the later steps', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('radio', { name: /Reject request/i }))
      await user.type(screen.getByLabelText(/^Reason/), 'Duplicate of an existing case')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))

      expect(onReject).toHaveBeenCalledWith(mockRequest.id, 'Duplicate of an existing case')
      expect(onProceed).not.toHaveBeenCalled()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()
      expect(screen.getAllByText('Closed').length).toBe(3)
      expect(screen.getByDisplayValue('Duplicate of an existing case')).toBeDisabled()
    })

    it('shows a decided request locked', () => {
      renderDetail({
        request: {
          ...mockRequest,
          status: 'Exited',
          decision: { status: 'rejected', reason: 'Not a fit' },
        },
      })
      expect(screen.getByRole('radio', { name: /Reject request/i, checked: true })).toBeDisabled()
      expect(screen.getByDisplayValue('Not a fit')).toBeDisabled()
      expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
    })
  })

  describe('Director: request more information', () => {
    it('opens an email template, sends it and reports it', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('radio', { name: /Request more info/i }))
      await user.type(screen.getByLabelText(/^Reason/), 'Please share regulatory documents.')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))

      const dialog = screen.getByRole('dialog', { name: /Request more information/i })
      expect(within(dialog).getByText(/sarah@medtechinnovations.com/)).toBeInTheDocument()
      expect((within(dialog).getByLabelText('Message') as HTMLTextAreaElement).value).toContain(
        'Please share regulatory documents.'
      )
      expect(onRequestInfo).not.toHaveBeenCalled()
      await user.click(within(dialog).getByRole('button', { name: /Send & put on hold/i }))
      expect(onRequestInfo).toHaveBeenCalledWith(
        mockRequest.id,
        expect.objectContaining({ to: 'sarah@medtechinnovations.com' })
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(onProceed).not.toHaveBeenCalled()
      expect(onReject).not.toHaveBeenCalled()
    })

    it('can cancel the email and keep working', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('radio', { name: /Request more info/i }))
      await user.type(screen.getByLabelText(/^Reason/), 'Need docs')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Submit decision/i })).toBeEnabled()
    })

    it('shows an on-hold case waiting for the vendor and resumes it', async () => {
      const user = userEvent.setup()
      renderDetail({
        request: {
          ...mockRequest,
          status: 'On Hold',
          holdInfo: { requestedOn: '22 Oct 2026', to: 'a@b.com', subject: 'S', body: 'B' },
        },
      })
      expect(screen.getByText('On hold: waiting for the vendor')).toBeInTheDocument()
      expect(screen.getByText(/Information requested on 22 Oct 2026/)).toBeInTheDocument()
      expect(
        screen.getByRole('radio', { name: /Request more info/i, checked: true })
      ).toBeDisabled()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: 'Mark info received' }))
      expect(onResume).toHaveBeenCalledWith(mockRequest.id)
    })

    it('shows the hold without a resume button to the Partnership Admin', () => {
      renderDetail({
        userProfile: adminProfile,
        request: { ...mockRequest, status: 'On Hold' },
      })
      expect(screen.getByText('On hold: waiting for the vendor')).toBeInTheDocument()
      expect(screen.getByText('The case continues once the vendor replies.')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mark info received' })).not.toBeInTheDocument()
    })
  })

  describe('Director: Strategic Alignment, Internal Canvas and Approval', () => {
    it('sends the Strategy Team request first, then opens Internal Canvas', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)

      expect(
        screen.getByText('Choose the Strategy Team reviewer, then send the request.')
      ).toBeInTheDocument()
      expect(screen.getByText('Ahmed Darwish')).toBeInTheDocument()
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Internal Canvas/ })).toBeDisabled()

      // Only one strategy member for now
      expect(screen.getByRole('button', { name: /Add Member/i })).toBeDisabled()
      expect(screen.getByText('You can add 1 member for now.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Preview criteria/i })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /View member response/i })
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Send Request' }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('Send to the Strategy Team')).toBeInTheDocument()
      expect(within(dialog).queryByText('Internal Interest')).not.toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Send Request' }))

      expect(screen.getByRole('heading', { level: 2, name: 'Internal Canvas' })).toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeEnabled()
    })

    it('lets the Director replace the only strategy member', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)
      await user.click(screen.getByRole('button', { name: /Delete respondent/i }))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.queryByText('Ahmed Darwish')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled()

      await user.click(screen.getByRole('button', { name: /Add Member/i }))
      await user.selectOptions(screen.getByRole('combobox'), 'strat-2')
      await user.type(screen.getByPlaceholderText(/Enter reason why/i), 'Growth expertise.')
      const adds = screen.getAllByRole('button', { name: /Add Member/i })
      await user.click(adds[adds.length - 1])
      expect(screen.getByText('Leena Thomas')).toBeInTheDocument()
    })

    it('chooses Internal Interest reviewers on Internal Canvas and sends them', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)
      await sendRequest(user)

      expect(
        screen.getByText('Choose the Internal Interest reviewers, then send the request.')
      ).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader', { name: 'Recommended' }).length).toBe(1)
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
      expect(screen.getByText('Sara Malik')).toBeInTheDocument()
      expect(screen.queryByText('Ahmed Darwish')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Preview questions/i })).toBeInTheDocument()

      // Remove one respondent and add another
      await user.click(screen.getAllByRole('button', { name: /Delete respondent/i })[0])
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Add Respondant/i }))
      await user.selectOptions(screen.getByRole('combobox'), 'cand-1')
      await user.type(screen.getByPlaceholderText(/Enter reason why/i), 'Clinical expertise.')
      const adds = screen.getAllByRole('button', { name: 'Add Respondant' })
      await user.click(adds[adds.length - 1])
      expect(screen.getByText('Dr. Mona Al Hashimi')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Send Request' }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('Send to Internal Interest')).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Send Request' }))

      expect(screen.getByRole('heading', { level: 2, name: 'Approval' })).toBeInTheDocument()
    })

    it('shows the reviewer finding animation once per team step', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ animateAgentRun: true })

      await user.click(screen.getByRole('button', { name: 'Skip' }))
      runTimers(2)
      await approveBrief(user)

      expect(screen.getByRole('heading', { name: 'Finding the Strategy team' })).toBeInTheDocument()
      expect(screen.queryByText('Ahmed Darwish')).not.toBeInTheDocument()
      runTimers(4)
      expect(screen.getByText('Ahmed Darwish')).toBeInTheDocument()

      await sendRequest(user)
      expect(
        screen.getByRole('heading', { name: 'Finding the Internal Interest team' })
      ).toBeInTheDocument()
      runTimers(4)
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    })

    it('tracks both teams on Approval and keeps the earlier steps read-only', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)
      await sendRequest(user)
      await sendRequest(user)

      expect(screen.getByRole('heading', { level: 2, name: 'Approval' })).toBeInTheDocument()
      expect(screen.getByText('Tracking')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader', { name: 'Status' }).length).toBe(2)
      expect(screen.getAllByRole('columnheader', { name: 'Deadline' }).length).toBe(2)
      expect(screen.getAllByRole('columnheader', { name: 'Decision' }).length).toBe(2)
      expect(screen.getAllByText('5 days').length).toBeGreaterThan(0)
      expect(screen.getByText('Proceed')).toBeInTheDocument()
      expect(screen.getByText('Conditional')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Send Request/i })).not.toBeInTheDocument()

      const viewButtons = screen.getAllByRole('button', { name: /View member response/i })
      expect(viewButtons.length).toBe(6)

      // Internal response: actual answers only
      await user.click(viewButtons[1])
      expect(screen.getByDisplayValue('21% over 12 months')).toBeInTheDocument()
      expect(screen.queryByText(/Value and Need Statement/i)).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Close modal/i }))

      // Strategy response: judgements with the reviewer's reason for each edit
      await user.click(viewButtons[0])
      expect(screen.getAllByText('Manually edited').length).toBe(2)
      expect(screen.getByDisplayValue(/Partnering is faster than building/i)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Close modal/i }))

      // Earlier steps show who was asked, with nothing left to edit
      await user.click(stepper().getByRole('button', { name: /Internal Canvas/ }))
      expect(screen.getByText('Request sent')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Delete respondent/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Add Respondant/i })).not.toBeInTheDocument()
      await user.click(stepper().getByRole('button', { name: /Strategic Alignment/ }))
      expect(screen.getByText('Request sent')).toBeInTheDocument()
    })

    it('opens an in-progress request straight on Approval with the earlier steps completed', async () => {
      const user = userEvent.setup()
      renderDetail({ request: INITIAL_PARTNERSHIP_REQUESTS[1], animateAgentRun: true })
      expect(screen.getByRole('heading', { level: 2, name: 'Approval' })).toBeInTheDocument()
      expect(stepper().getAllByText('Completed').length).toBe(3)
      await user.click(stepper().getByRole('button', { name: /Initial Assessment Brief/ }))
      expect(
        screen.getByRole('radio', { name: /Approve for internal review/i, checked: true })
      ).toBeDisabled()
    })
  })

  describe('Partnership Admin', () => {
    const adminCase = INITIAL_PARTNERSHIP_REQUESTS[4]

    it('runs the admin checks, then shows the brief with the routing decision', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ userProfile: adminProfile, request: adminCase, animateAgentRun: true })

      // One page: no stepper for the admin
      expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()
      expect(screen.getByText('Applicant history')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Skip' }))
      runTimers(2)

      expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /View checks and findings/i }))
      const drawer = screen.getByRole('dialog', { name: 'AI analysis details' })
      ;[
        'Applicant history',
        'Duplicate check',
        'CoE backlog check',
        'Service line and KPI mapping',
        'Solution maturity scoring',
        'Vendor screening',
      ].forEach((title) => expect(within(drawer).getByText(title)).toBeInTheDocument())
      expect(within(drawer).getByText('7 checks completed')).toBeInTheDocument()
      expect(within(drawer).queryByText(/risks? identified/)).not.toBeInTheDocument()
    })

    it('marks a repeat applicant as re-applying', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: INITIAL_PARTNERSHIP_REQUESTS[2] })
      await user.click(screen.getByRole('button', { name: /View checks and findings/i }))
      expect(screen.getByText('Re-applying')).toBeInTheDocument()
    })

    it('rejects with a reason', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: adminCase })
      await user.click(screen.getByRole('radio', { name: /^Reject request/i }))
      await user.type(screen.getByLabelText(/^Reason/), 'Out of scope')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'reject',
        type: undefined,
        reason: 'Out of scope',
      })
    })

    it('proceeds with a case type, each showing the agent confidence', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: adminCase })
      await user.click(screen.getByRole('radio', { name: /^Proceed/i }))
      expect(screen.getByLabelText('Partnership confidence High')).toBeInTheDocument()
      expect(screen.getByLabelText('Procure confidence Medium')).toBeInTheDocument()
      expect(screen.getByLabelText('M&A confidence Low')).toBeInTheDocument()
      await user.click(screen.getByRole('radio', { name: /Partnership/i }))
      await user.type(screen.getByLabelText(/^Reason/), 'Fits the pilot route')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))
      // First routing needs no confirmation
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'proceed',
        type: 'Partnership',
        reason: 'Fits the pilot route',
      })
    })

    const routed = (type: 'Partnership' | 'Procure', queue: 'director' | 'routed') => ({
      ...adminCase,
      queue,
      caseType: type,
      adminDecision: {
        action: 'proceed' as const,
        type,
        reason: 'Original reason',
        date: 'Just now',
      },
    })

    it('confirms before moving a Partnership case out of the Director list', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership', 'director') })
      await user.click(screen.getByRole('button', { name: /Edit submission/i }))
      await user.click(screen.getByRole('radio', { name: /Procure/i }))
      await user.click(screen.getByRole('button', { name: /Update submission/i }))

      const dialog = screen.getByRole('dialog', { name: /Change how this case is routed/i })
      expect(
        within(dialog).getByText("This will remove the case from the Director's list.")
      ).toBeInTheDocument()
      expect(within(dialog).getByText('Partnership')).toBeInTheDocument()
      expect(within(dialog).getByText('Procure')).toBeInTheDocument()
      expect(onRoute).not.toHaveBeenCalled()

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      expect(onRoute).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: /Update submission/i }))
      await user.click(screen.getByRole('button', { name: 'Confirm change' }))
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'proceed',
        type: 'Procure',
        reason: 'Original reason',
      })
    })

    it('confirms before sending a routed case to the Director, and when rejecting', async () => {
      const user = userEvent.setup()
      const { unmount } = renderDetail({
        userProfile: adminProfile,
        request: routed('Procure', 'routed'),
      })
      await user.click(screen.getByRole('button', { name: /Edit submission/i }))
      await user.click(screen.getByRole('radio', { name: /Partnership/i }))
      await user.click(screen.getByRole('button', { name: /Update submission/i }))
      expect(screen.getByText('This will send the case to the Director.')).toBeInTheDocument()
      unmount()

      renderDetail({ userProfile: adminProfile, request: routed('Partnership', 'director') })
      await user.click(screen.getByRole('button', { name: /Edit submission/i }))
      await user.click(screen.getByRole('radio', { name: /^Reject request/i }))
      await user.click(screen.getByRole('button', { name: /Update submission/i }))
      expect(
        screen.getByText("This will remove the case from the Director's list.")
      ).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })

    it('does not confirm when only the reason changes', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership', 'director') })
      await user.click(screen.getByRole('button', { name: /Edit submission/i }))
      await user.type(screen.getByLabelText(/^Reason/), ' Updated.')
      await user.click(screen.getByRole('button', { name: /Update submission/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(onRoute).toHaveBeenCalledWith(
        adminCase.id,
        expect.objectContaining({ reason: 'Original reason Updated.' })
      )
    })

    it('locks the decision once the Director has decided', () => {
      renderDetail({
        userProfile: adminProfile,
        request: {
          ...routed('Partnership', 'director'),
          status: 'In Progress',
          decision: { status: 'proceeded', reason: 'Approved' },
        },
      })
      expect(screen.queryByRole('button', { name: /Edit submission/i })).not.toBeInTheDocument()
      expect(screen.getByText(/The Director has decided/)).toBeInTheDocument()
    })
  })

  describe('Internal Interest Team', () => {
    it('goes Brief, Questionnaire, with a view-only form after submit', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: internalProfile })

      expect(
        stepper()
          .getAllByRole('button')
          .map((b) => b.textContent)
      ).toEqual([
        expect.stringContaining('Initial Assessment Brief'),
        expect.stringContaining('Questionnaire'),
      ])
      expect(stepper().getByRole('button', { name: /Questionnaire/ })).toBeDisabled()

      // No decision form, no vendor contact details
      expect(
        screen.queryByRole('radio', { name: /Approve for internal review/i })
      ).not.toBeInTheDocument()
      expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /View vendor response/i }))
      expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Close' }))

      await user.click(screen.getByRole('button', { name: /Continue to Questionnaire/i }))
      expect(screen.getByText('Internal Evaluation Questionnaire')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^Submit$/i }))
      expect(screen.getByText('Submit Questionnaire')).toBeInTheDocument()
      expect(screen.queryByText(/Approval/i)).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Confirm & Send' }))

      expect(screen.queryByRole('button', { name: /^Submit$/i })).not.toBeInTheDocument()
      expect(screen.getByLabelText('Baseline today')).toBeDisabled()
      expect(screen.getByRole('radio', { name: /Yes, we would sponsor/i })).toBeDisabled()
    })
  })

  describe('Strategy Team', () => {
    it('goes Brief, Judgement and asks for a reason on edits', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: strategyProfile })

      expect(stepper().getByRole('button', { name: /Judgement/ })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: /Continue to Judgement/i }))
      expect(screen.getAllByText('Agent pre-filled').length).toBe(7)

      await user.selectOptions(
        within(screen.getByTestId('criterion-architecture')).getByRole('combobox'),
        'Fits'
      )
      expect(screen.getByText('Manually edited')).toBeInTheDocument()

      await user.click(screen.getByRole('radio', { name: /Proceed with a condition/i }))
      expect(
        (screen.getByLabelText(/Condition and summary/i) as HTMLTextAreaElement).value
      ).toContain('Proceed only if the vendor resolves')
      const submit = screen.getByRole('button', { name: /Submit decision/i })
      expect(submit).toBeDisabled()

      await user.type(screen.getByLabelText(/Why are you changing this/i), 'Hosted in UAE')
      expect(submit).toBeEnabled()
      await user.click(submit)
      await user.click(screen.getByRole('button', { name: 'Confirm & Submit' }))

      expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
      screen.getAllByRole('combobox').forEach((c) => expect(c).toBeDisabled())
    })
  })
})
