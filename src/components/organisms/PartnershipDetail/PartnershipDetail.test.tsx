import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { PartnershipDetail } from './PartnershipDetail'
import { INITIAL_PARTNERSHIP_REQUESTS, type PartnershipRequest } from '@/types/partnership.types'

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

describe('PartnershipDetail', () => {
  const mockRequest = INITIAL_PARTNERSHIP_REQUESTS[0]
  const adminCase = INITIAL_PARTNERSHIP_REQUESTS[4]
  const onBack = vi.fn()
  const onProceed = vi.fn()
  const onReject = vi.fn()
  const onRequestInfo = vi.fn()
  const onResume = vi.fn()
  const onRoute = vi.fn()
  const onLog = vi.fn()
  const onSendReview = vi.fn()
  const onSubmitReview = vi.fn()
  const onCaseAction = vi.fn()

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
        onLog={onLog}
        onSendReview={onSendReview}
        onSubmitReview={onSubmitReview}
        onCaseAction={onCaseAction}
        animateAgentRun={false}
        {...props}
      />
    )

  /** A case the Director has approved, so Internal Canvas is open */
  const approved = (patch: Partial<PartnershipRequest> = {}): PartnershipRequest => ({
    ...mockRequest,
    status: 'In Progress',
    decision: { status: 'proceeded', reason: 'Strong fit' },
    ...patch,
  })

  const approvedBy = (team: 'internal' | 'strategy') => ({
    status: 'approved' as const,
    by: team,
    date: 'Just now',
  })

  const runTimers = (ms: number, times = 1) => {
    for (let i = 0; i < times; i++) {
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    }
  }

  const stepper = () => within(screen.getByRole('navigation', { name: 'Review progress' }))

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
      // No Overview tab on any profile
      expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Review', 'Audit Log'])
    })

    it('shows a compact header card: vendor, location, referred by and submitted on', () => {
      renderDetail()
      const card = screen
        .getByRole('heading', { name: 'MedTech Innovations' })
        .closest('.rounded-2xl') as HTMLElement
      expect(within(card).getByText('Pending')).toBeInTheDocument()
      expect(within(card).getByText('Sarah Ahmed')).toBeInTheDocument()
      expect(within(card).getByText('UAE, Dubai')).toBeInTheDocument()
      expect(within(card).getByText('Referred by:')).toBeInTheDocument()
      expect(within(card).getByText('Submitted on:')).toBeInTheDocument()
      // No phone, email, founding year or separator line
      expect(card.textContent).not.toMatch(/@|\+971|Founded in/)
      expect(card.querySelector('.border-t')).toBeNull()
    })

    it('hides the vendor name and referrer from reviewers, who still see location and date', () => {
      renderDetail({ userProfile: internalProfile })
      expect(screen.queryByText('Referred by:')).not.toBeInTheDocument()
      expect(screen.queryByText('Sarah Ahmed')).not.toBeInTheDocument()
      expect(screen.getAllByText('UAE, Dubai').length).toBeGreaterThan(0)
      expect(screen.getByText('Submitted on:')).toBeInTheDocument()
    })

    it('shows no green decision banner once a decision is recorded', () => {
      const { unmount } = renderDetail({ request: approved() })
      expect(screen.queryByText('Status: Approved to Proceed')).not.toBeInTheDocument()
      expect(screen.queryByText(/Director Notes/)).not.toBeInTheDocument()
      unmount()
      renderDetail({
        request: {
          ...mockRequest,
          status: 'Exited',
          decision: { status: 'rejected', reason: 'No' },
        },
      })
      expect(screen.queryByText('Status: Request Rejected')).not.toBeInTheDocument()
    })

    it('shows the audit log with its colour legend and the case events, newest first', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('tab', { name: 'Audit Log' }))
      expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument()
      expect(
        within(screen.getByRole('list', { name: 'Colour legend' })).getAllByRole('listitem')
      ).toHaveLength(4)
      const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
      expect(titles).toEqual([
        'Routed as Partnership',
        'Initial assessment brief generated',
        'Partnership request submitted',
      ])
    })

    it('triggers onBack', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
      expect(onBack).toHaveBeenCalled()
    })
  })

  describe('thinking animation', () => {
    it('plays when a case is opened, then shows the brief and logs the analysis', () => {
      vi.useFakeTimers()
      renderDetail({
        animateAgentRun: true,
        request: { ...mockRequest, auditLog: [] },
      })
      expect(screen.getByText('ANALYZING')).toBeInTheDocument()
      // Simple: one line of progress, no checklist
      expect(screen.getByRole('status')).toHaveTextContent('Reading vendor form details…')
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
      // Nothing else is on screen while the agent thinks
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Back to Partnership Requests' })
      ).not.toBeInTheDocument()
      expect(onLog).not.toHaveBeenCalled()

      runTimers(1500, 8)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByText('AI analysis completed')).toBeInTheDocument()
      expect(onLog).toHaveBeenCalledTimes(1)
      expect(onLog).toHaveBeenCalledWith(
        mockRequest.id,
        expect.objectContaining({
          key: `${mockRequest.id}-brief-generated`,
          title: 'Initial assessment brief generated',
          actor: 'Triage Agent',
          kind: 'agent',
        })
      )
    })

    it('also logs the risks it found', () => {
      vi.useFakeTimers()
      renderDetail({
        animateAgentRun: true,
        request: {
          ...mockRequest,
          overviewCards: { ...mockRequest.overviewCards, regulatory: 'Unclear' },
        },
      })
      runTimers(1500, 8)
      expect(onLog).toHaveBeenCalledTimes(2)
      expect(onLog).toHaveBeenLastCalledWith(
        mockRequest.id,
        expect.objectContaining({
          title: 'Risks identified',
          kind: 'critical',
          actor: 'Triage Agent',
        })
      )
    })

    it('is skipped for a case the Director has already decided', () => {
      renderDetail({ animateAgentRun: true, request: approved() })
      expect(screen.queryByText('ANALYZING')).not.toBeInTheDocument()
    })
  })

  describe('Director: Initial Assessment Brief', () => {
    it('shows the verdict chip, the brief sections and a plain steps list', () => {
      renderDetail()
      expect(
        stepper()
          .getAllByRole('button')
          .map((b) => b.textContent)
      ).toEqual([
        expect.stringContaining('Initial Assessment Brief'),
        expect.stringContaining('Internal Canvas'),
        expect.stringContaining('Strategic Alignment'),
        expect.stringContaining('NDA & Discovery'),
        expect.stringContaining('Value & Due Diligence'),
      ])
      ;[
        /Internal Canvas/,
        /Strategic Alignment/,
        /NDA & Discovery/,
        /Value & Due Diligence/,
      ].forEach((name) => expect(stepper().getByRole('button', { name })).toBeDisabled())
      expect(stepper().queryByRole('button', { name: /Approval/ })).not.toBeInTheDocument()

      expect(screen.getByRole('heading', { name: 'Agent Verdict' })).toBeInTheDocument()
      expect(screen.getByText('Proceed')).toBeInTheDocument()
      expect(screen.getByText('Triage Agent Analysis')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Company Information' })).toBeInTheDocument()
    })

    it('opens the Agent Actions drawer from the banner', async () => {
      const user = userEvent.setup()
      renderDetail()
      expect(screen.getByText('AI analysis completed')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Agent Actions' }))
      const drawer = screen.getByRole('dialog', { name: 'Agent Actions' })
      expect(within(drawer).getByText('Duplicate check')).toBeInTheDocument()
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

    it('keeps only Next in a bar that stays in view', () => {
      renderDetail()
      const bar = screen.getByText(/Review the brief, then record your decision/).parentElement!
      expect(bar.className).toContain('sticky')
      expect(bar.className).toContain('bottom-0')
      expect(
        within(bar)
          .getAllByRole('button')
          .map((b) => b.textContent)
      ).toEqual(['Next'])
      // The decision is taken in a popup, not a form on the page
      expect(screen.queryByLabelText(/^Decision/)).not.toBeInTheDocument()
    })

    const decide = async (user: ReturnType<typeof userEvent.setup>, option: string) => {
      await user.click(screen.getByRole('button', { name: 'Next' }))
      const dialog = screen.getByRole('dialog', { name: 'Your decision' })
      await user.selectOptions(within(dialog).getByLabelText(/^Decision/), option)
      return dialog
    }

    it('proceeds from the Decision dropdown with an unlabelled reason, then opens Internal Canvas', async () => {
      const user = userEvent.setup()
      renderDetail()
      const dialog = await decide(user, 'Proceed')
      expect(within(dialog).getByLabelText('Reason')).toBeInTheDocument()
      expect(within(dialog).queryByText(/optional/i)).not.toBeInTheDocument()
      await user.type(within(dialog).getByLabelText(/^Reason/), 'Strong evidence')
      await user.click(within(dialog).getByRole('button', { name: 'Proceed' }))

      expect(onProceed).toHaveBeenCalledWith(mockRequest.id, 'Strong evidence')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Internal Canvas' })).toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()
      expect(
        screen.queryByText(/Review the brief, then record your decision/)
      ).not.toBeInTheDocument()
    })

    it('proceeds without any reason', async () => {
      const user = userEvent.setup()
      renderDetail()
      const dialog = await decide(user, 'Proceed')
      await user.click(within(dialog).getByRole('button', { name: 'Proceed' }))
      expect(onProceed).toHaveBeenCalledWith(mockRequest.id, '')
    })

    it('needs a reason to reject', async () => {
      const user = userEvent.setup()
      renderDetail()
      const dialog = await decide(user, 'Reject')
      const reject = within(dialog).getByRole('button', { name: 'Reject request' })
      expect(reject).toBeDisabled()
      await user.type(within(dialog).getByLabelText(/^Reason/), 'Duplicate of an existing case')
      await user.click(reject)
      expect(onReject).toHaveBeenCalledWith(mockRequest.id, 'Duplicate of an existing case')
      expect(onProceed).not.toHaveBeenCalled()
      expect(screen.getAllByText('Closed').length).toBe(4)
    })

    it('has no decision section or footer once the brief has been decided', async () => {
      const user = userEvent.setup()
      renderDetail({
        request: {
          ...mockRequest,
          status: 'Exited',
          decision: { status: 'rejected', reason: 'Not a fit' },
        },
      })
      await user.click(stepper().getByRole('button', { name: /Initial Assessment Brief/ }))
      expect(screen.queryByRole('heading', { name: 'Your Decision' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
      expect(screen.queryByDisplayValue('Not a fit')).not.toBeInTheDocument()
    })
  })

  describe('Director: request more information', () => {
    it('shows the email template in the same popup and reports the request', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: 'Next' }))
      const decision = screen.getByRole('dialog', { name: 'Your decision' })
      await user.selectOptions(within(decision).getByLabelText(/^Decision/), 'Request more info')
      // The email template is in the same popup, with a copy button on each field
      expect(within(decision).getAllByRole('button', { name: /^Copy / })).toHaveLength(3)
      expect((within(decision).getByLabelText('Message') as HTMLTextAreaElement).value).toContain(
        'Hi Sarah Ahmed,'
      )
      await user.click(within(decision).getByRole('button', { name: 'Mark information requested' }))
      expect(onRequestInfo).toHaveBeenCalledWith(
        mockRequest.id,
        expect.objectContaining({ to: 'sarah@medtechinnovations.com' })
      )
      expect(onProceed).not.toHaveBeenCalled()
      expect(onReject).not.toHaveBeenCalled()
    })

    it('shows an information-requested case waiting for the vendor and resumes it', async () => {
      const user = userEvent.setup()
      renderDetail({
        request: {
          ...mockRequest,
          status: 'Information Requested',
          holdInfo: { requestedOn: '22 Oct 2026', to: 'a@b.com', subject: 'S', body: 'B' },
        },
      })
      expect(screen.getByText('Information requested: waiting for the vendor')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Internal Canvas/ })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Mark info received' }))
      expect(onResume).toHaveBeenCalledWith(mockRequest.id)
    })
  })

  describe('Director: Internal Canvas', () => {
    it('shows the reviewers without a questionnaire preview link', () => {
      renderDetail({ request: approved() })
      expect(
        screen.getByText(
          'Choose the Internal Interest reviewers and the questions they will answer, then send the request.'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
      expect(screen.getByText('Sara Malik')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Preview questions/i })).not.toBeInTheDocument()
      expect(screen.queryByText(/Reviewers answer 5 short questions/)).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /View member response/i })
      ).not.toBeInTheDocument()
    })

    it('lets the Director remove a respondent and add another', async () => {
      const user = userEvent.setup()
      renderDetail({ request: approved() })
      await user.click(screen.getAllByRole('button', { name: /Delete respondent/i })[0])
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Add Respondant/i }))
      await user.selectOptions(screen.getByRole('combobox'), 'cand-1')
      await user.type(screen.getByPlaceholderText(/Enter reason why/i), 'Clinical expertise.')
      const adds = screen.getAllByRole('button', { name: 'Add Respondant' })
      await user.click(adds[adds.length - 1])
      expect(screen.getByText('Dr. Mona Al Hashimi')).toBeInTheDocument()
    })

    it('sends the reviewers and the chosen questions, then waits for approval', async () => {
      const user = userEvent.setup()
      renderDetail({ request: approved() })
      await user.click(screen.getByRole('button', { name: 'Send Request' }))

      const dialog = screen.getByRole('dialog', { name: 'Select questionnaire' })
      await user.selectOptions(within(dialog).getByLabelText('Questionnaire'), 'technical')
      expect(within(dialog).queryByRole('checkbox', { name: 'Sara Malik' })).not.toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Next' }))
      await user.click(within(dialog).getByRole('checkbox', { name: 'Sara Malik' }))
      await user.click(within(dialog).getByRole('button', { name: 'Send Request' }))
      await user.click(
        within(screen.getByRole('dialog', { name: 'Send to Internal Interest?' })).getByRole(
          'button',
          {
            name: 'Send Request',
          }
        )
      )

      expect(onSendReview).toHaveBeenCalledTimes(1)
      const [id, team, payload] = onSendReview.mock.calls[0]
      expect(id).toBe(mockRequest.id)
      expect(team).toBe('internal')
      expect(payload.members).toHaveLength(4)
      expect(payload.questionnaire.name).toBe('Technical Questionnaire')
      expect(payload.questionnaire.questions).toHaveLength(3)
      // The popup closes once sent
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      // The stage now waits: tracking layout, the simulation dropdown where the chip used to be
      expect(
        screen.queryByText('Awaiting approval', { selector: 'span.inline-flex' })
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText(/Simulate the team/)).toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Internal Canvas/ })).toHaveTextContent(
        'Awaiting approval'
      )
      expect(screen.getAllByRole('columnheader', { name: 'Status' })).toHaveLength(1)
      expect(screen.queryByRole('button', { name: 'Send Request' })).not.toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeDisabled()
    })

    it('shows the reviewer finding animation once', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      renderDetail({ request: approved(), animateAgentRun: true })
      expect(screen.queryByText('ANALYZING')).not.toBeInTheDocument()
      expect(screen.getByText('Finding the Internal Interest team…')).toBeInTheDocument()
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()
      runTimers(1000, 4)
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    })

    it('opens Strategic Alignment once the Internal Interest team has approved', async () => {
      const user = userEvent.setup()
      renderDetail({
        request: approved({
          sent: { internal: true },
          stageApprovals: { internal: approvedBy('internal') },
        }),
      })
      expect(stepper().getByRole('button', { name: /Internal Canvas/ })).toHaveTextContent(
        'Approved'
      )
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toBeEnabled()
      expect(
        screen.getByRole('heading', { level: 2, name: 'Strategic Alignment' })
      ).toBeInTheDocument()

      // The earlier stage keeps its tracking table, and the simulation stays until the next
      // stage has been sent
      await user.click(stepper().getByRole('button', { name: /Internal Canvas/ }))
      expect(screen.getByLabelText(/Simulate the team/)).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader', { name: 'Decision' })).toHaveLength(1)
    })
  })

  describe('Director: Strategic Alignment', () => {
    const afterInternal = (patch: Partial<PartnershipRequest> = {}) =>
      approved({
        sent: { internal: true },
        stageApprovals: { internal: approvedBy('internal') },
        ...patch,
      })

    it('has one strategy member and sends its own request', async () => {
      const user = userEvent.setup()
      renderDetail({ request: afterInternal() })
      expect(
        screen.getByText('Choose the Strategy Team reviewer, then send the request.')
      ).toBeInTheDocument()
      expect(screen.getByText('Dr. Zainab')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add Member/i })).toBeDisabled()
      expect(screen.getByText('You can add 1 member for now.')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Send Request' }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText('Send to the Strategy Team')).toBeInTheDocument()
      // The one reviewer is not a choice: no checkbox, and the note is tall enough not to scroll
      expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument()
      expect(within(dialog).getByLabelText('Note to Strategy Team')).toHaveAttribute('rows', '9')
      await user.click(within(dialog).getByRole('button', { name: 'Send Request' }))
      expect(onSendReview).toHaveBeenCalledWith(
        mockRequest.id,
        'strategy',
        expect.objectContaining({ members: [expect.objectContaining({ name: 'Dr. Zainab' })] })
      )
      expect(
        screen.getByText('Awaiting approval', { selector: 'span.inline-flex' })
      ).toBeInTheDocument()
    })

    it('lets the Director replace the only strategy member', async () => {
      const user = userEvent.setup()
      renderDetail({ request: afterInternal() })
      await user.click(screen.getByRole('button', { name: /Delete respondent/i }))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: /Add Member/i }))
      await user.selectOptions(screen.getByRole('combobox'), 'strat-2')
      await user.type(screen.getByPlaceholderText(/Enter reason why/i), 'Growth expertise.')
      const adds = screen.getAllByRole('button', { name: /Add Member/i })
      await user.click(adds[adds.length - 1])
      expect(screen.getByText('Leena Thomas')).toBeInTheDocument()
    })

    it('shows the Strategy Team approval, and a declined one', () => {
      const { unmount } = renderDetail({
        request: afterInternal({
          sent: { internal: true, strategy: true },
          stageApprovals: { internal: approvedBy('internal'), strategy: approvedBy('strategy') },
        }),
      })
      expect(stepper().getAllByText('Approved')).toHaveLength(2)
      unmount()

      renderDetail({
        request: afterInternal({
          sent: { internal: true, strategy: true },
          stageApprovals: {
            internal: approvedBy('internal'),
            strategy: { status: 'declined', by: 'x', date: 'Just now' },
          },
        }),
      })
      expect(stepper().getByRole('button', { name: /Strategic Alignment/ })).toHaveTextContent(
        'Declined'
      )
      expect(screen.getByText('Declined', { selector: 'span.inline-flex' })).toBeInTheDocument()
    })

    it('shows the reviewers’ own answers and the Strategy Team decision with its pre-read', async () => {
      const user = userEvent.setup()
      renderDetail({ request: INITIAL_PARTNERSHIP_REQUESTS[1] })
      expect(stepper().getAllByText('Approved')).toHaveLength(2)
      await user.click(stepper().getByRole('button', { name: /Strategic Alignment/ }))

      // Strategy response: the decision, the reason and the pre-read summary
      await user.click(screen.getByRole('button', { name: /View member response/i }))
      expect(screen.getAllByText('Proceed').length).toBeGreaterThan(1)
      expect(screen.getAllByText(/vendor commits to UAE hosting/).length).toBeGreaterThan(0)
      expect(
        within(screen.getByRole('list', { name: 'Pre-read summary' })).getAllByRole('heading', {
          level: 3,
        })
      ).toHaveLength(6)
      expect(screen.getByText('Vendor_Security_Questionnaire.docx')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Close modal/i }))

      // Internal response: the questions they were asked and their answers, same layout
      await user.click(stepper().getByRole('button', { name: /Internal Canvas/ }))
      await user.click(screen.getAllByRole('button', { name: /View member response/i })[0])
      expect(screen.getByDisplayValue(/Sepsis is still recognised late/)).toBeDisabled()
      expect(
        screen.getByText(
          'Which KPI would move, what is the baseline today, and what change would matter?'
        )
      ).toBeInTheDocument()
      expect(screen.queryByText(/Value and Need Statement/i)).not.toBeInTheDocument()
    })
  })

  describe('Partnership Admin', () => {
    it('has no stepper or workflow progress, and shows the verdict', () => {
      renderDetail({ userProfile: adminProfile, request: adminCase })
      expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Agent Verdict' })).toBeInTheDocument()
      expect(screen.queryByText('Workflow Progress')).not.toBeInTheDocument()
    })

    it('shows the admin checks in Agent Actions', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: INITIAL_PARTNERSHIP_REQUESTS[2] })
      await user.click(screen.getByRole('button', { name: 'Agent Actions' }))
      const drawer = screen.getByRole('dialog', { name: 'Agent Actions' })
      ;[
        'Applicant history',
        'Duplicate check',
        'CoE backlog check',
        'Service line and KPI mapping',
        'Solution maturity scoring',
        'Vendor screening',
      ].forEach((title) => expect(within(drawer).getByText(title)).toBeInTheDocument())
      expect(within(drawer).getAllByText('Re-applying').length).toBeGreaterThan(0)
    })

    it('keeps Proceed and Reject in a bar that stays in view', () => {
      renderDetail({ userProfile: adminProfile, request: adminCase })
      const bar = screen.getByText('Action required: decide where this case goes.').parentElement!
      expect(bar.className).toContain('sticky')
      expect(bar.className).toContain('bottom-0')
      expect(within(bar).getByRole('button', { name: 'Proceed' })).toBeInTheDocument()
      expect(within(bar).getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    })

    it('proceeds by choosing a request type, with an optional reason', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: adminCase })
      await user.click(screen.getByRole('button', { name: 'Proceed' }))
      const dialog = screen.getByRole('dialog', { name: 'Proceed with this case' })
      const proceed = within(dialog).getByRole('button', { name: 'Proceed' })
      expect(proceed).toBeDisabled()
      await user.click(within(dialog).getByRole('button', { name: /Request type/ }))
      expect(within(dialog).getByLabelText('Partnership confidence High')).toBeInTheDocument()
      await user.click(
        within(dialog)
          .getByRole('option', { name: /Partnership/ })
          .querySelector('button')!
      )
      await user.click(proceed)
      // First routing needs no confirmation, and no reason is needed to proceed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'proceed',
        type: 'Partnership',
        reason: '',
      })
    })

    it('needs a reason to reject', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: adminCase })
      await user.click(screen.getByRole('button', { name: 'Reject' }))
      const dialog = screen.getByRole('dialog', { name: 'Reject this case' })
      const reject = within(dialog).getByRole('button', { name: 'Reject request' })
      expect(reject).toBeDisabled()
      await user.type(within(dialog).getByLabelText(/^Reason/), 'Out of scope')
      await user.click(reject)
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'reject',
        type: undefined,
        reason: 'Out of scope',
      })
    })

    const routed = (type: 'Partnership' | 'Procure'): PartnershipRequest => ({
      ...adminCase,
      queue: type === 'Partnership' ? 'director' : 'routed',
      caseType: type,
      adminDecision: { action: 'proceed', type, reason: 'Original reason', date: 'Just now' },
    })

    it('shows the status as Approved with the type, and no green status banner', () => {
      renderDetail({
        userProfile: adminProfile,
        request: {
          ...routed('Partnership'),
          decision: { status: 'proceeded', reason: 'Approved by the Director' },
          status: 'In Progress',
        },
      })
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Partnership')).toBeInTheDocument()
      expect(screen.queryByText('Status: Approved to Proceed')).not.toBeInTheDocument()
      expect(screen.queryByText(/Director Notes/)).not.toBeInTheDocument()
    })

    it('shows the status as Rejected', () => {
      renderDetail({
        userProfile: adminProfile,
        request: {
          ...adminCase,
          queue: 'closed',
          status: 'Exited',
          adminDecision: { action: 'reject', reason: 'No', date: 'Just now' },
        },
      })
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })

    /** Edit only reassigns the request type: no Proceed or Reject buttons */
    const reassign = async (user: ReturnType<typeof userEvent.setup>, type: RegExp) => {
      await user.click(screen.getByRole('button', { name: 'Edit' }))
      const modal = screen.getByRole('dialog', { name: 'Reassign request type' })
      expect(
        within(modal).queryByRole('button', { name: 'Reject request' })
      ).not.toBeInTheDocument()
      expect(within(modal).queryByLabelText(/^Reason/)).not.toBeInTheDocument()
      await user.click(within(modal).getByRole('button', { name: /Request type/ }))
      await user.click(within(modal).getByRole('option', { name: type }).querySelector('button')!)
      await user.click(within(modal).getByRole('button', { name: 'Reassign' }))
    }

    it('confirms in the shared popup before moving a Partnership case out of the Director list', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership') })
      await reassign(user, /Procure/)

      const dialog = screen.getByRole('dialog', { name: 'Change how this case is routed?' })
      expect(
        within(dialog).getByText("This will remove the case from the Director's list.")
      ).toBeInTheDocument()
      expect(within(dialog).getByText('Partnership')).toBeInTheDocument()
      expect(within(dialog).getByText('Procure')).toBeInTheDocument()
      expect(onRoute).not.toHaveBeenCalled()

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      expect(onRoute).not.toHaveBeenCalled()
    })

    it('confirms moving a routed case to the Director, keeping the earlier reason', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Procure') })
      await reassign(user, /Partnership/)
      await user.click(screen.getByRole('button', { name: 'Confirm change' }))
      expect(onRoute).toHaveBeenCalledWith(adminCase.id, {
        action: 'proceed',
        type: 'Partnership',
        reason: 'Original reason',
      })
    })

    it('keeps Reassign disabled until a different type is chosen', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership') })
      await user.click(screen.getByRole('button', { name: 'Edit' }))
      const modal = screen.getByRole('dialog', { name: 'Reassign request type' })
      expect(within(modal).getByRole('button', { name: /Request type/ })).toHaveTextContent(
        'Partnership'
      )
      expect(within(modal).getByRole('button', { name: 'Reassign' })).toBeDisabled()
      // Picking the type it already has changes nothing
      await user.click(within(modal).getByRole('button', { name: /Request type/ }))
      await user.click(
        within(modal)
          .getByRole('option', { name: /Partnership/ })
          .querySelector('button')!
      )
      expect(within(modal).getByRole('button', { name: 'Reassign' })).toBeDisabled()
      await user.click(within(modal).getByRole('button', { name: /Request type/ }))
      await user.click(
        within(modal)
          .getByRole('option', { name: /Procure/ })
          .querySelector('button')!
      )
      expect(within(modal).getByRole('button', { name: 'Reassign' })).toBeEnabled()
    })

    it('shows the request type list in the flow of the popup, so it is never clipped', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership') })
      await user.click(screen.getByRole('button', { name: 'Edit' }))
      const modal = screen.getByRole('dialog', { name: 'Reassign request type' })
      await user.click(within(modal).getByRole('button', { name: /Request type/ }))
      const list = within(modal).getByRole('listbox', { name: 'Request type' })
      expect(list.className).not.toContain('absolute')
      expect(modal.className).toContain('max-h-[90vh]')
    })

    it('shows Edit as a text-only button in the primary colour', () => {
      renderDetail({ userProfile: adminProfile, request: routed('Partnership') })
      const edit = screen.getByRole('button', { name: 'Edit' })
      expect(edit.className).toContain('text-[#008a8a]')
      expect(edit.className).not.toMatch(/\bborder\b|bg-white/)
      expect(edit.querySelector('svg')).not.toBeNull()
    })

    it('makes a recorded decision view-only, with Edit as the only way to change it', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: routed('Partnership') })
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Edit' }))
      // Still no Proceed or Reject buttons behind the popup
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('shows neither company details nor the action bar on the audit log', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: adminProfile, request: adminCase })
      expect(screen.getByRole('heading', { name: adminCase.companyName })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Proceed' })).toBeInTheDocument()
      await user.click(screen.getByRole('tab', { name: 'Audit Log' }))
      expect(screen.queryByRole('heading', { name: adminCase.companyName })).not.toBeInTheDocument()
      expect(screen.queryByText('Referred by:')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument()
    })

    it('locks the decision once the Director has decided', () => {
      renderDetail({
        userProfile: adminProfile,
        request: {
          ...routed('Partnership'),
          status: 'In Progress',
          decision: { status: 'proceeded', reason: 'Approved' },
        },
      })
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    })
  })

  describe('Internal Interest Team', () => {
    it('has no workflow stages, then answers the default questions into a view-only form', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: internalProfile })

      expect(screen.queryByRole('navigation', { name: 'Review progress' })).not.toBeInTheDocument()
      // No verdict and no vendor contact details
      expect(screen.queryByRole('heading', { name: 'Agent Verdict' })).not.toBeInTheDocument()
      expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /View vendor response/i }))
      expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Close' }))

      await user.click(screen.getByRole('button', { name: /Continue to Questionnaire/i }))
      expect(screen.getByText('Internal Evaluation Questionnaire')).toBeInTheDocument()
      expect(screen.queryByText(/Research needed|Attachment/)).not.toBeInTheDocument()
      const boxes = screen.getAllByRole('textbox')
      expect(boxes).toHaveLength(5)
      const submit = screen.getByRole('button', { name: 'Submit' })
      expect(submit).toBeDisabled()
      for (const box of boxes) await user.type(box, 'An answer')
      await user.click(submit)

      const confirm = screen.getByRole('dialog', { name: 'Submit questionnaire?' })
      expect(confirm).toHaveTextContent('After this you will not be able to edit them')
      await user.click(within(confirm).getByRole('button', { name: 'Submit' }))
      expect(onSubmitReview).toHaveBeenCalledWith(
        mockRequest.id,
        'internal',
        expect.objectContaining({
          answers: expect.arrayContaining([
            expect.objectContaining({ questionId: 'q1', answer: 'An answer' }),
          ]),
        })
      )
      expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument()
      screen.getAllByRole('textbox').forEach((b) => expect(b).toBeDisabled())
    })

    it('answers exactly the questions the Director sent, and may skip optional ones', async () => {
      const user = userEvent.setup()
      renderDetail({
        userProfile: internalProfile,
        request: {
          ...mockRequest,
          sent: { internal: true },
          sentQuestionnaire: {
            name: 'Technical Questionnaire',
            version: 2,
            questions: [
              {
                id: 'x1',
                text: 'Which hospitals use it?',
                cue: 'Name the sites.',
                mandatory: true,
              },
              { id: 'x2', text: 'Anything else?', cue: 'Optional notes.', mandatory: false },
            ],
          },
        },
      })
      await user.click(screen.getByRole('button', { name: /Continue to Questionnaire/i }))
      expect(screen.getByText('Technical Questionnaire')).toBeInTheDocument()
      expect(screen.getByText('Which hospitals use it?')).toBeInTheDocument()
      expect(screen.getAllByRole('textbox')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
      await user.type(screen.getAllByRole('textbox')[0], 'Three UAE sites')
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
    })
  })

  describe('Strategy Team', () => {
    it('opens on the brief, with no animation, the workflow stages and a fixed Next', () => {
      renderDetail({ userProfile: strategyProfile, animateAgentRun: true })
      expect(screen.queryByText('ANALYZING')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Company Information' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Agent Verdict' })).not.toBeInTheDocument()
      expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
      expect(
        stepper()
          .getAllByRole('button')
          .map((b) => b.textContent)
      ).toEqual([
        expect.stringContaining('Initial Assessment Brief'),
        expect.stringContaining('Pre-read Summary'),
      ])
      expect(stepper().getByRole('button', { name: /Pre-read Summary/ })).toBeDisabled()
      const bar = screen.getByRole('button', { name: 'Next' }).parentElement!
      expect(bar.className).toContain('sticky')
      expect(bar.className).toContain('bottom-0')
    })

    it('goes from Next to the Prepare Pre-read Summary screen, with nothing pre-selected', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: strategyProfile })
      await user.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByRole('heading', { name: 'Prepare Pre-read Summary' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Skip/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Documents added' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
      // The brief is still one click away in the stages
      await user.click(stepper().getByRole('button', { name: /Initial Assessment Brief/ }))
      expect(screen.getByRole('heading', { name: 'Company Information' })).toBeInTheDocument()
    })

    it('generates the pre-read below the vendor card with the simple animation, then decides with a confirmation', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ userProfile: strategyProfile })
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: /Generate Summary/ }))

      // The vendor card and tabs stay; the animation sits below them
      expect(screen.getByText('GENERATING')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'MedTech Innovations' })).toBeInTheDocument()
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Pre-read summary' })).not.toBeInTheDocument()
      runTimers(1100, 8)

      expect(
        within(screen.getByRole('list', { name: 'Pre-read summary' })).getAllByRole('heading', {
          level: 3,
        })
      ).toHaveLength(6)
      const bar = screen.getByText(/Review the pre-read, then record your decision/).parentElement!
      expect(bar.className).toContain('sticky')
      expect(
        within(bar)
          .getAllByRole('button')
          .map((b) => b.textContent)
      ).toEqual(['Reject', 'Proceed'])

      // Reject needs a reason, then a confirmation before it is recorded
      await user.click(within(bar).getByRole('button', { name: 'Reject' }))
      const popup = screen.getByRole('dialog', { name: 'Reject this partnership' })
      const reject = within(popup).getByRole('button', { name: 'Reject partnership' })
      expect(reject).toBeDisabled()
      await user.type(within(popup).getByLabelText(/^Reason/), 'No UAE hosting')
      await user.click(reject)
      expect(onSubmitReview).not.toHaveBeenCalled()
      const confirm = screen.getByRole('dialog', { name: 'Submit your decision?' })
      expect(confirm).toHaveTextContent('Reject')
      expect(confirm).toHaveTextContent('No UAE hosting')
      await user.click(within(confirm).getByRole('button', { name: 'Submit' }))

      expect(onSubmitReview).toHaveBeenCalledWith(
        mockRequest.id,
        'strategy',
        expect.objectContaining({
          response: expect.objectContaining({
            finalDecision: 'Reject',
            finalDecisionNote: 'No UAE hosting',
          }),
        })
      )
      expect(screen.queryByText(/Review the pre-read, then record/)).not.toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })

    it('proceeds without a reason after confirming, and records the documents added', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ userProfile: strategyProfile })
      await user.click(screen.getByRole('button', { name: 'Next' }))
      await user.click(screen.getByRole('button', { name: 'Browse files' }))
      await user.upload(screen.getByLabelText('Supporting documents'), [
        new File(['x'], 'deck.pptx'),
        new File(['x'], 'plan.pdf'),
      ])
      await user.click(screen.getByRole('button', { name: 'Add documents' }))
      await user.click(screen.getByRole('button', { name: 'Remove plan.pdf' }))
      await user.click(screen.getByRole('button', { name: /Generate Summary/ }))
      runTimers(1100, 8)

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
      expect(onSubmitReview).toHaveBeenCalledWith(
        mockRequest.id,
        'strategy',
        expect.objectContaining({
          response: expect.objectContaining({
            finalDecision: 'Proceed',
            finalDecisionNote: '',
            documents: ['deck.pptx'],
          }),
        })
      )
      expect(screen.getByText('Proceeded')).toBeInTheDocument()
    })

    it('shows a decided case as a read-only pre-read straight away, with both stages done', () => {
      renderDetail({
        userProfile: strategyProfile,
        request: INITIAL_PARTNERSHIP_REQUESTS[1],
      })
      expect(
        within(screen.getByRole('list', { name: 'Pre-read summary' })).getAllByRole('heading', {
          level: 3,
        })
      ).toHaveLength(6)
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.getByText('Proceeded')).toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Pre-read Summary/ })).toBeEnabled()
    })
  })

  describe('Sponsor', () => {
    const sponsorProfile = profile('sponsor', 'Sponsor')

    it('follows the same five steps as the Director, with the verdict and vendor details', () => {
      renderDetail({ userProfile: sponsorProfile, request: INITIAL_PARTNERSHIP_REQUESTS[2] })
      expect(stepper().getAllByRole('button')).toHaveLength(5)
      expect(screen.getByText('Referred by:')).toBeInTheDocument()
      // No Director actions
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Send Request' })).not.toBeInTheDocument()
    })

    it('opens on the stage the case has reached, where the sponsor decides', () => {
      renderDetail({ userProfile: sponsorProfile, request: INITIAL_PARTNERSHIP_REQUESTS[2] })
      expect(
        screen.getByRole('heading', { level: 2, name: 'Value & Due Diligence' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Proceed' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    })

    it('sends the sponsor actions through onCaseAction', async () => {
      const user = userEvent.setup()
      renderDetail({
        userProfile: sponsorProfile,
        request: {
          ...INITIAL_PARTNERSHIP_REQUESTS[2],
          value: { ...INITIAL_PARTNERSHIP_REQUESTS[2].value, businessCase: undefined },
        },
      })
      await user.upload(screen.getByLabelText('Upload business case'), new File(['x'], 'case.pdf'))
      expect(onCaseAction).toHaveBeenCalledWith(INITIAL_PARTNERSHIP_REQUESTS[2].id, {
        type: 'businessCase',
        name: 'case.pdf',
      })
    })

    it('shows the Director the same stages, with the NDA actions but not the sponsor ones', async () => {
      const user = userEvent.setup()
      renderDetail({ request: INITIAL_PARTNERSHIP_REQUESTS[2] })
      expect(
        screen.getByRole('heading', { level: 2, name: 'Value & Due Diligence' })
      ).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Proceed' })).not.toBeInTheDocument()
      expect(screen.getByText('Waiting for the lead sponsor to decide.')).toBeInTheDocument()
      await user.click(stepper().getByRole('button', { name: /NDA & Discovery/ }))
      // Signed already: the alignment pack, with the signed NDA behind Back
      expect(screen.getByRole('heading', { name: 'Alignment Pack' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Back to signed NDA/ }))
      expect(screen.getByRole('button', { name: 'Upload new version' })).toBeInTheDocument()
    })
  })
})
