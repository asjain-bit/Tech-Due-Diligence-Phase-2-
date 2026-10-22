import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { PartnershipDetail } from './PartnershipDetail'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

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

describe('PartnershipDetail', () => {
  const mockRequest = INITIAL_PARTNERSHIP_REQUESTS[0]
  const onBack = vi.fn()
  const onProceed = vi.fn()
  const onReject = vi.fn()

  const renderDetail = (props: Partial<React.ComponentProps<typeof PartnershipDetail>> = {}) =>
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
        animateAgentRun={false}
        {...props}
      />
    )

  /** Director: approve on the brief so the Internal Review step opens */
  const approveBrief = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
    await user.type(screen.getByLabelText(/Decision rationale/i), 'Strong evidence')
    await user.click(screen.getByRole('button', { name: /Submit decision/i }))
  }

  /** Timers inside the animations are scheduled after each render, so step through them */
  const runTimers = (seconds: number) => {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }
  }

  const stepper = () => within(screen.getByRole('navigation', { name: 'Review progress' }))

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders header card without company description and without vendor designation, with Referred by', () => {
    renderDetail()

    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(
      screen.queryByText('AI-powered diagnostic platform for early disease detection')
    ).not.toBeInTheDocument()

    expect(screen.getByText('Sarah Ahmed')).toBeInTheDocument()
    expect(screen.queryByText('Business Development Director')).not.toBeInTheDocument()
    expect(screen.getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
    expect(screen.getByText('+971 50 123 4567')).toBeInTheDocument()
    expect(screen.getByText('Founded in 2018')).toBeInTheDocument()
    expect(screen.getByText('UAE, Dubai')).toBeInTheDocument()
    expect(screen.getByText('Referred by:')).toBeInTheDocument()
    expect(screen.getByText('Dr. Noura Al Ghaithi')).toBeInTheDocument()
  })

  it('keeps the Overview tab with workflow progress and key information', async () => {
    const user = userEvent.setup()
    renderDetail()

    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Overview', 'Review'])
    await user.click(screen.getByRole('tab', { name: 'Overview' }))

    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText('Intake & Triage')).toBeInTheDocument()
    expect(screen.queryByText('1. Submission')).not.toBeInTheDocument()
    expect(screen.getByText(/Agent Recommendation:/i)).toBeInTheDocument()
    expect(screen.getByText(/High Confidence/i)).toBeInTheDocument()
    expect(screen.getByText(/Submitted on:/i)).toBeInTheDocument()
    expect(screen.getByText('Solution Overview')).toBeInTheDocument()
    expect(screen.getByText('Key Information')).toBeInTheDocument()
    expect(screen.getByText('Regulatory Approvals')).toBeInTheDocument()
  })

  it('triggers onBack when Back to Partnership Requests is clicked', async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole('button', { name: 'Back to Partnership Requests' }))
    expect(onBack).toHaveBeenCalled()
  })

  describe('agent run animation', () => {
    it('plays the checklist, keeps later steps locked, then moves to the brief', () => {
      vi.useFakeTimers()
      renderDetail({ animateAgentRun: true })

      // Step 1 is current while the agent works; everything after it is locked
      expect(screen.getByRole('heading', { name: 'Agent Actions' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Initial Assessment Brief/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Internal Review/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Approval/ })).toBeDisabled()
      expect(screen.getByRole('progressbar', { name: 'Agent progress' })).toBeInTheDocument()

      // Whole run (5 sources + 6 checks), then the short settle before auto-advance
      runTimers(12)
      expect(screen.getByText('6 checks completed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Initial Assessment Brief/ })).toBeEnabled()

      runTimers(2)
      expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
    })

    it('lets the user go back to the finished checklist after the run', async () => {
      const user = userEvent.setup()
      renderDetail()
      await user.click(screen.getByRole('button', { name: /Agent Actions/ }))
      expect(screen.getByText('6 checks completed')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Duplicate check/ }))
      expect(screen.getByText('Live cases compared')).toBeInTheDocument()
    })

    it('can be skipped', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ animateAgentRun: true })
      await user.click(screen.getByRole('button', { name: 'Skip' }))
      expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    })
  })

  describe('Director workflow', () => {
    it('shows the brief written from the vendor form, the agent verdict and the vendor response', async () => {
      const user = userEvent.setup()
      renderDetail()

      // Step 2 is current and steps 3 and 4 are still locked
      expect(screen.getByRole('button', { name: /Agent Actions/ })).toBeEnabled()
      expect(screen.getByRole('button', { name: /Internal Review/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Approval/ })).toBeDisabled()
      expect(screen.getByText('To review')).toBeInTheDocument()

      expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
      expect(screen.getByText('AI-generated')).toBeInTheDocument()
      expect(screen.getByText(/was founded in 2018/i)).toBeInTheDocument()
      expect(screen.getByText('What they ask from M42')).toBeInTheDocument()
      expect(screen.getByText('Clinical sandbox integration with M42 Epic EHR')).toBeInTheDocument()
      expect(screen.getByText('Agent verdict')).toBeInTheDocument()
      expect(screen.getByText(/High · 94%/)).toBeInTheDocument()
      expect(
        screen.getByText(/Three things that would change this recommendation/)
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /View vendor response/i }))
      const dialog = screen.getByRole('dialog', { name: /Vendor Submission/i })
      expect(within(dialog).getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Close' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('requires a decision and a rationale before moving on', async () => {
      const user = userEvent.setup()
      renderDetail()

      const submit = screen.getByRole('button', { name: /Submit decision/i })
      expect(submit).toBeDisabled()
      await user.click(screen.getByRole('radio', { name: /Approve for internal review/i }))
      expect(submit).toBeDisabled()
      await user.type(screen.getByLabelText(/Decision rationale/i), 'Strong evidence')
      expect(submit).toBeEnabled()
      await user.click(submit)

      expect(onProceed).toHaveBeenCalledWith(mockRequest.id, 'Strong evidence')
      expect(screen.getByRole('heading', { name: 'Review & Alignment' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Initial Assessment Brief/ })).toBeEnabled()
    })

    it('records a rejection with its rationale and closes the later steps', async () => {
      const user = userEvent.setup()
      renderDetail()

      await user.click(screen.getByRole('radio', { name: /Reject request/i }))
      expect(screen.getByRole('button', { name: /Submit decision/i })).toBeDisabled()
      await user.type(screen.getByLabelText(/Decision rationale/i), 'Duplicate of an existing case')
      await user.click(screen.getByRole('button', { name: /Submit decision/i }))

      expect(onReject).toHaveBeenCalledWith(mockRequest.id, 'Duplicate of an existing case')
      expect(onProceed).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: /Internal Review/ })).toBeDisabled()
      expect(screen.getAllByText('Closed').length).toBe(2)
    })

    it('shows the decision as locked when returning to a decided request', () => {
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

    it('shows Internal Review with reviewers, one strategy member and one send button', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)

      expect(
        screen.getByRole('heading', { level: 2, name: 'Review & Alignment' })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Choose the reviewers for each team, then send one request to both.')
      ).toBeInTheDocument()

      expect(screen.getAllByRole('columnheader', { name: 'Recommended' }).length).toBe(2)
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
      expect(screen.getByText('Sara Malik')).toBeInTheDocument()
      expect(screen.getByText('Ahmed Darwish')).toBeInTheDocument()

      // One send button; previews sit under the titles; no response icons yet
      expect(screen.getAllByRole('button', { name: /Send Request/i }).length).toBe(1)
      expect(screen.getByRole('button', { name: /Preview questions/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Preview criteria/i })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /View member response/i })
      ).not.toBeInTheDocument()

      // Strategy team is limited to 1 member for now
      expect(screen.getByRole('button', { name: /Add Member/i })).toBeDisabled()
      expect(screen.getByText('You can add 1 member for now.')).toBeInTheDocument()
    })

    it('lets the Director remove a respondent and add another', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)

      const deleteButtons = screen.getAllByRole('button', { name: /Delete respondent/i })
      await user.click(deleteButtons[0])
      expect(screen.getByText('Remove Respondent')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Delete' }))
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Add Respondant/i }))
      await user.selectOptions(screen.getByRole('combobox'), 'cand-1')
      await user.type(screen.getByPlaceholderText(/Enter reason why/i), 'Clinical expertise.')
      const addButtons = screen.getAllByRole('button', { name: 'Add Respondant' })
      await user.click(addButtons[addButtons.length - 1])
      expect(screen.getByText('Dr. Mona Al Hashimi')).toBeInTheDocument()
    })

    it('shows a finding-reviewers animation the first time Internal Review opens', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderDetail({ request: { ...mockRequest, status: 'Pending' }, animateAgentRun: true })

      await user.click(screen.getByRole('button', { name: 'Skip' }))
      runTimers(2)
      await approveBrief(user)

      expect(screen.getByText('Finding reviewers')).toBeInTheDocument()
      expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()
      runTimers(5)
      expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    })

    it('sends one request to both teams, then tracks them on Approval', async () => {
      const user = userEvent.setup()
      renderDetail()
      await approveBrief(user)

      await user.click(screen.getByRole('button', { name: /Send Request to Both Teams/i }))
      expect(screen.getByRole('dialog', { name: /Send Review Requests/i })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Send to Both Teams' }))

      // Approval step opens with the tracking tables
      expect(screen.getByRole('heading', { level: 2, name: 'Approval' })).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader', { name: 'Status' }).length).toBe(2)
      expect(screen.getAllByRole('columnheader', { name: 'Deadline' }).length).toBe(2)
      expect(screen.getAllByRole('columnheader', { name: 'Decision' }).length).toBe(2)
      expect(screen.getAllByText('5 days').length).toBeGreaterThan(0)
      expect(screen.getByText('Proceed')).toBeInTheDocument()
      expect(screen.getByText('Conditional')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Add Respondant/i })).not.toBeInTheDocument()

      const viewButtons = screen.getAllByRole('button', { name: /View member response/i })
      expect(viewButtons.length).toBe(6)

      // Internal response: actual answers only
      await user.click(viewButtons[0])
      expect(screen.getByDisplayValue('21% over 12 months')).toBeInTheDocument()
      expect(screen.queryByText(/Value and Need Statement/i)).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Close modal/i }))

      // Strategy response: judgements with the reviewer's reason for each edit
      await user.click(viewButtons[5])
      expect(screen.getAllByText('Manually edited').length).toBe(2)
      expect(screen.getByDisplayValue(/Partnering is faster than building/i)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Close modal/i }))

      // Going back to Internal Review is read-only
      await user.click(screen.getByRole('button', { name: /Internal Review/ }))
      expect(
        screen.getByRole('heading', { level: 2, name: 'Review & Alignment' })
      ).toBeInTheDocument()
      expect(screen.getByText(/Requests sent to both teams/)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Delete respondent/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Send Request/i })).not.toBeInTheDocument()
    })

    it('opens an in-progress request straight on Approval with earlier steps completed', async () => {
      const user = userEvent.setup()
      renderDetail({ request: INITIAL_PARTNERSHIP_REQUESTS[1], animateAgentRun: true })

      expect(screen.getByRole('heading', { level: 2, name: 'Approval' })).toBeInTheDocument()
      expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(3)
      await user.click(screen.getByRole('button', { name: /Initial Assessment Brief/ }))
      expect(
        screen.getByRole('radio', { name: /Approve for internal review/i, checked: true })
      ).toBeDisabled()
    })
  })

  describe('Internal Interest Team workflow', () => {
    it('goes Agent Actions, Brief, Questionnaire with a view-only form after submit', async () => {
      const user = userEvent.setup()
      renderDetail({ userProfile: internalProfile })

      expect(screen.queryByRole('button', { name: /Internal Review/ })).not.toBeInTheDocument()
      expect(stepper().getByRole('button', { name: /Questionnaire/ })).toBeDisabled()

      // The brief has no decision form and no vendor contact details
      expect(screen.queryByText('Your decision')).not.toBeInTheDocument()
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

  describe('Strategy Team workflow', () => {
    it('goes Agent Actions, Brief, Judgement and asks for a reason on edits', async () => {
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
      expect(screen.getByText(/a reason for 1 changed judgement/i)).toBeInTheDocument()

      await user.type(screen.getByLabelText(/Why are you changing this/i), 'Hosted in UAE')
      expect(submit).toBeEnabled()
      await user.click(submit)
      await user.click(screen.getByRole('button', { name: 'Confirm & Submit' }))

      expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
      screen.getAllByRole('combobox').forEach((c) => expect(c).toBeDisabled())
    })
  })
})
