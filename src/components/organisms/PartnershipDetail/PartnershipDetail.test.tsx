import React from 'react'
import { render, screen } from '@testing-library/react'
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

  it('switches to Partnership Brief tab, renders Proceed and Reject buttons with modal popups, and navigates sections', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const briefTab = screen.getByRole('tab', { name: /Partnership Brief/i })
    await user.click(briefTab)

    // Proceed and Reject buttons visible in the Brief tab
    expect(screen.getByRole('button', { name: /Proceed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument()

    // Clicking Proceed opens the modal
    await user.click(screen.getByRole('button', { name: /Proceed/i }))
    expect(screen.getByText('Proceed to Next Stage')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Cancel/i }))

    expect(screen.getByRole('button', { name: /Company Information/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Company Experience/i })).toBeInTheDocument()
    expect(screen.getByText('1. Company Information')).toBeInTheDocument()
    expect(screen.getByText(/2. Company's Stage of Maturity and Experience/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Company Experience/i }))
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
      screen.getByText(
        'Send requests to internal stakeholders and strategy team to review this partnership in sequence.'
      )
    ).toBeInTheDocument()

    // Table columns: count column removed, role & department removed from separate headers, Recommended added
    expect(screen.queryByRole('columnheader', { name: '#' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Name' })[0]).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Role' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Department' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Recommended' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Expertise' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader', { name: 'Actions' })[0]).toBeInTheDocument()

    // Send review buttons for both teams
    const sendButtons = screen.getAllByRole('button', { name: /Send Request/i })
    expect(sendButtons.length).toBe(2)

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

  it('updates table to sent state with status, deadline, decision, and view options when request is sent', async () => {
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

    // Click Send Request for Internal Interest
    const sendButtons = screen.getAllByRole('button', { name: /^Send Request$/i })
    await user.click(sendButtons[0])

    // Inside modal, click Send Request
    const allSendBtns = screen.getAllByRole('button', { name: 'Send Request' })
    await user.click(allSendBtns[allSendBtns.length - 1])

    // Table transforms: shows Status, Deadline (5 days), Decision without Questionnaire column
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Deadline' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Decision' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Questionnaire' })).not.toBeInTheDocument()
    expect(screen.getAllByText('5 days').length).toBeGreaterThan(0)
    expect(screen.getByText('Proceed')).toBeInTheDocument()

    // Send request button and add respondant button removed for internal interest
    expect(screen.queryByRole('button', { name: /Add Respondant/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Send Request$/i }).length).toBe(1)
  })
})
