import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PartnershipDetail } from './PartnershipDetail'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('PartnershipDetail', () => {
  const mockRequest = INITIAL_PARTNERSHIP_REQUESTS[0]
  const onBack = vi.fn()
  const onProceed = vi.fn()
  const onReject = vi.fn()

  it('renders header card without company description and without vendor designation, with Referred by', () => {
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Header info: Company name present, description removed
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()

    // Subtitle description under company name is removed
    expect(
      screen.queryByText('AI-powered diagnostic platform for early disease detection')
    ).not.toBeInTheDocument()

    // Contact person name present, designation removed
    expect(screen.getByText('Sarah Ahmed')).toBeInTheDocument()
    expect(screen.queryByText('Business Development Director')).not.toBeInTheDocument()

    // Other details and Referred by
    expect(screen.getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
    expect(screen.getByText('+971 50 123 4567')).toBeInTheDocument()
    expect(screen.getByText('Founded in 2018')).toBeInTheDocument()
    expect(screen.getByText('UAE, Dubai')).toBeInTheDocument()
    expect(screen.getByText('Referred by:')).toBeInTheDocument()
    expect(screen.getByText('Dr. Noura Al Ghaithi')).toBeInTheDocument()
  })

  it('renders overview inside single large box with workflow without numbers and Agent Recommendation chip', () => {
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Proceed and Reject buttons removed from Overview page
    expect(screen.queryByRole('button', { name: /^Proceed$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Reject$/i })).not.toBeInTheDocument()

    // Workflow Progress heading without numbers in steps
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText('Submission')).toBeInTheDocument()
    expect(screen.getByText('Intake & Triage')).toBeInTheDocument()
    expect(screen.getByText('Screening & Fit')).toBeInTheDocument()
    expect(screen.getByText('NDA & Discovery')).toBeInTheDocument()
    expect(screen.getByText('Value Assessment')).toBeInTheDocument()

    // Numbers 1., 2., 3. removed from step titles
    expect(screen.queryByText('1. Submission')).not.toBeInTheDocument()
    expect(screen.queryByText('2. Intake & Triage')).not.toBeInTheDocument()

    // Agent Recommendation chip only (one word proceed/reject and confidence high/medium/low)
    expect(screen.getByText(/Agent Recommendation:/i)).toBeInTheDocument()
    expect(screen.getByText(/Proceed/i)).toBeInTheDocument()
    expect(screen.getByText(/High Confidence/i)).toBeInTheDocument()

    // Submitted on at bottom right without '3 days ago'
    expect(screen.getByText(/Submitted on:/i)).toBeInTheDocument()
    expect(screen.queryByText(/days ago/i)).not.toBeInTheDocument()

    // Solution Overview & tags
    expect(screen.getByText('Solution Overview')).toBeInTheDocument()
    expect(
      screen.getByText(/MedTech Innovations has proposed an AI-powered diagnostic platform/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Medical Imaging')).toBeInTheDocument()

    // Key Information
    expect(screen.getByText('Key Information')).toBeInTheDocument()
    expect(screen.getByText('Focus Area(s)')).toBeInTheDocument()
    expect(screen.getByText('Solution Maturity')).toBeInTheDocument()
    expect(screen.getByText('Regulatory Approvals')).toBeInTheDocument()
  })

  it('shows the agent recommendation, agent actions and vendor submission in the Internal Assessment Brief', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    expect(screen.queryByRole('tab', { name: /^Partnership Brief$/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Internal Assessment Brief/i }))

    // Agent recommendation with reasoning and signals
    expect(screen.getByText('Proceed to the next stage')).toBeInTheDocument()
    expect(screen.getByText('What the agent weighed')).toBeInTheDocument()

    // Agent actions timeline
    expect(screen.getByRole('heading', { name: /Agent Actions/i })).toBeInTheDocument()
    ;[
      'Duplicate Check',
      'Classification',
      'Maturity Research',
      'KPI Mapping',
      'Baseline Needed to Test',
      'Commodity Test',
      'Assessment Brief',
    ].forEach((title) => expect(screen.getByText(title)).toBeInTheDocument())

    // Vendor form opens in a dialog with the actual questions
    await user.click(screen.getByRole('button', { name: /View vendor submission/i }))
    const dialog = screen.getByRole('dialog', { name: /Vendor Submission/i })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Key Assessment Areas')).toBeInTheDocument()
    expect(
      screen.getByText("How would you describe your company's stage of maturity and experience?")
    ).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /Close/i })[0])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('requires a reason for both Proceed and Reject', async () => {
    const user = userEvent.setup()
    const proceed = vi.fn()
    const reject = vi.fn()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={proceed}
        onReject={reject}
      />
    )
    await user.click(screen.getByRole('tab', { name: /Internal Assessment Brief/i }))

    // Proceed: blocked without a reason
    await user.click(screen.getByRole('button', { name: /^Proceed$/i }))
    expect(screen.getByText('Proceed to Next Stage')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Confirm & Proceed/i }))
    expect(screen.getByText(/A reason is mandatory when proceeding/i)).toBeInTheDocument()
    expect(proceed).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/Reason/i), 'Strong evidence')
    await user.click(screen.getByRole('button', { name: /Confirm & Proceed/i }))
    expect(proceed).toHaveBeenCalledWith(mockRequest.id, 'Strong evidence')

    // Reject: blocked without a reason
    await user.click(screen.getByRole('tab', { name: /Internal Assessment Brief/i }))
    await user.click(screen.getByRole('button', { name: /^Reject$/i }))
    await user.click(screen.getByRole('button', { name: /Confirm Rejection/i }))
    expect(screen.getByText(/A reason is mandatory when rejecting/i)).toBeInTheDocument()
    expect(reject).not.toHaveBeenCalled()
  })

  it('switches to Internal Interest tab matching Image 1 with stakeholders table and modals', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Switch to Internal Review tab
    const internalTab = screen.getByRole('tab', { name: /Internal Review/i })
    await user.click(internalTab)

    // Heading without icon and subtitle
    expect(
      screen.getByRole('heading', { level: 2, name: 'Review & Alignment' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Choose the reviewers for each team, then send one request to both.')
    ).toBeInTheDocument()

    // Table columns: count column removed, role & department removed from separate headers, Recommended added
    expect(screen.queryByRole('columnheader', { name: '#' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Name' })[0]).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Role' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Department' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Recommended' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Expertise' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Actions' })[0]).toBeInTheDocument()

    // One single send button for both teams
    expect(screen.getAllByRole('button', { name: /Send Request/i }).length).toBe(1)
    expect(screen.getByRole('button', { name: /Send Request to Both Teams/i })).toBeInTheDocument()

    // Question / criteria previews sit under each section title, not in the action area
    expect(screen.getByRole('button', { name: /Preview questions/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Preview criteria/i })).toBeInTheDocument()

    // No response icon until the request has been sent
    expect(screen.queryByRole('button', { name: /View member response/i })).not.toBeInTheDocument()

    // + Add Respondant and + Add Member buttons
    expect(screen.getByRole('button', { name: /Add Respondant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add Member/i })).toBeInTheDocument()
    expect(screen.getByText('You can add up to 5 respondents.')).toBeInTheDocument()

    // Table renders stakeholders from Image 1 with role just below name
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getByText(/Head of AI & Analytics/i)).toBeInTheDocument()
    expect(screen.getByText('Parag Agarwal')).toBeInTheDocument()
    expect(screen.getByText(/Radiology & Imaging Lead/i)).toBeInTheDocument()
    expect(screen.getByText('Najla Al Mansoori')).toBeInTheDocument()
    expect(screen.getByText('Khalid Al Zaabi')).toBeInTheDocument()
    expect(screen.getByText('Sara Malik')).toBeInTheDocument()

    // Click Delete on one respondent (icon-only button with aria-label)
    const deleteButtons = screen.getAllByRole('button', { name: /Delete respondent/i })
    await user.click(deleteButtons[0])

    // SOW-style Delete confirmation modal
    expect(screen.getByText('Remove Respondent')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument()

    // Confirm delete
    const modalDeleteBtn = screen.getByRole('button', { name: 'Delete' })
    await user.click(modalDeleteBtn)
    expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()

    // Add new respondent via dropdown selection
    const addBtn = screen.getByRole('button', { name: /Add Respondant/i })
    await user.click(addBtn)

    expect(screen.getByRole('heading', { level: 3, name: 'Add Respondant' })).toBeInTheDocument()
    // Select from dropdown
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'cand-1')

    // Rationale textarea
    const whyInput = screen.getByPlaceholderText(/Enter reason why/i)
    await user.type(whyInput, 'Extensive expertise in clinical diagnostics.')

    const confirmAddBtns = screen.getAllByRole('button', { name: 'Add Respondant' })
    await user.click(confirmAddBtns[confirmAddBtns.length - 1])

    expect(screen.getByText('Dr. Mona Al Hashimi')).toBeInTheDocument()
    expect(screen.getByText(/Chief Medical Officer/i)).toBeInTheDocument()
  })

  it('triggers onBack when Back to Partnership Requests is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const backBtn = screen.getByRole('button', { name: 'Back to Partnership Requests' })
    await user.click(backBtn)
    expect(onBack).toHaveBeenCalled()
  })

  it('sends one request to both teams and then shows status, deadline, decision and view options', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    await user.click(screen.getByRole('tab', { name: /Internal Review/i }))
    await user.click(screen.getByRole('button', { name: /Send Request to Both Teams/i }))

    // One modal covers both teams
    expect(screen.getByRole('dialog', { name: /Send Review Requests/i })).toBeInTheDocument()
    expect(screen.getByText(/Both teams are notified at the same time/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send to Both Teams' }))

    // Both tables switch to the sent layout
    expect(screen.getAllByRole('columnheader', { name: 'Status' }).length).toBe(2)
    expect(screen.getAllByRole('columnheader', { name: 'Deadline' }).length).toBe(2)
    expect(screen.getAllByRole('columnheader', { name: 'Decision' }).length).toBe(2)
    expect(screen.getAllByText('5 days').length).toBeGreaterThan(0)
    expect(screen.getByText('Proceed')).toBeInTheDocument()
    expect(screen.getByText('Conditional')).toBeInTheDocument()
    expect(screen.getByText(/^Requests sent to both teams$/i)).toBeInTheDocument()

    // Edit actions and previews are gone, response icons appear
    expect(screen.queryByRole('button', { name: /Add Respondant/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Preview questions/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Preview criteria/i })).not.toBeInTheDocument()
    const viewButtons = screen.getAllByRole('button', { name: /View member response/i })
    expect(viewButtons.length).toBe(6)

    // Internal response: actual answers only, no value/need statement
    await user.click(viewButtons[0])
    expect(screen.getByDisplayValue('21% over 12 months')).toBeInTheDocument()
    expect(screen.queryByText(/Value and Need Statement/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Close modal/i }))

    // Strategy response: actual judgements, edits flagged with the reviewer's reason
    await user.click(viewButtons[5])
    expect(screen.getAllByText('Manually edited').length).toBe(2)
    expect(screen.getByDisplayValue(/Partnering is faster than building/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Proceed only if the vendor commits/i)).toBeInTheDocument()
  })

  it('handles the Questionnaire flow with Submit, a simple confirmation and a view-only form', async () => {
    const user = userEvent.setup()
    const internalProfile = {
      id: 'evaluator',
      name: 'Mariam Al-Zaabi',
      designation: 'Internal Interest Team',
      email: 'mariam.alzaabi@m42.ae',
      roleTitle: 'Internal Interest Team',
    }
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
        userProfile={internalProfile}
      />
    )

    await user.click(screen.getByRole('tab', { name: /Questionnaire/i }))

    expect(screen.getByText('Internal Evaluation Questionnaire')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Submit$/i }))

    // Only a confirmation popup, no approval section and no value/need statements
    expect(screen.getByText('Submit Questionnaire')).toBeInTheDocument()
    expect(screen.queryByText(/Approval/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Value Statement/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm & Send' }))

    // Same form, now view-only
    expect(screen.queryByText('Submit Questionnaire')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Submit$/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Baseline today')).toBeDisabled()
    expect(screen.getByRole('radio', { name: /Yes, we would sponsor/i })).toBeDisabled()
    expect(screen.queryByText(/Value Statement/i)).not.toBeInTheDocument()
  })

  it('requires a reason when a strategy reviewer changes the agent judgement', async () => {
    const user = userEvent.setup()
    const strategyProfile = {
      id: 'strategy-fit',
      name: 'Omar Al-Hashemi',
      designation: 'Strategy Team',
      email: 'omar.alhashemi@m42.ae',
      roleTitle: 'Strategy Team',
    }
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
        userProfile={strategyProfile}
      />
    )

    await user.click(screen.getByRole('tab', { name: /Judgement/i }))
    expect(screen.getAllByText('Agent pre-filled').length).toBe(7)

    // Change one judgement: chip flips and a full-width reason field appears
    await user.selectOptions(
      within(screen.getByTestId('criterion-architecture')).getByRole('combobox'),
      'Fits'
    )
    expect(screen.getByText('Manually edited')).toBeInTheDocument()
    expect(screen.getAllByText('Agent pre-filled').length).toBe(6)

    // Pick a decision: the agent drafts the summary, but the reason is still missing
    await user.click(screen.getByRole('radio', { name: /Proceed with a condition/i }))
    expect(
      (screen.getByLabelText(/Condition and summary/i) as HTMLTextAreaElement).value
    ).toContain('Proceed only if the vendor resolves')
    const submit = screen.getByRole('button', { name: /Submit decision/i })
    expect(submit).toBeDisabled()
    expect(screen.getByText(/a reason for 1 changed judgement/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Why are you changing this/i), 'Hosted in UAE')
    expect(submit).toBeEnabled()

    // Reverting to the agent value clears the requirement
    await user.selectOptions(
      within(screen.getByTestId('criterion-architecture')).getByRole('combobox'),
      'Does not fit'
    )
    expect(screen.queryByLabelText(/Why are you changing this/i)).not.toBeInTheDocument()
  })
})
