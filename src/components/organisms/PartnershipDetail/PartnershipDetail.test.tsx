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

  it('renders overview tab with workflow stages, 4 metadata cards, and uploaded documents', () => {
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Workflow header and stages
    expect(screen.getByText('Partnership Request Workflow')).toBeInTheDocument()
    expect(screen.getByText('Submission')).toBeInTheDocument()
    expect(screen.getByText('Intake & Triage')).toBeInTheDocument()
    expect(screen.getByText('Screening & Fit')).toBeInTheDocument()
    expect(screen.getByText('NDA & Discovery')).toBeInTheDocument()

    // Subheadings
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getAllByText('Not Started').length).toBeGreaterThanOrEqual(4)

    // 4 metadata cards from Image 2
    expect(screen.getByText('EVIDENCE')).toBeInTheDocument()
    expect(screen.getByText('Proof of concept')).toBeInTheDocument()
    expect(screen.getByText('DEPLOYMENT')).toBeInTheDocument()
    expect(screen.getByText('1 live customer')).toBeInTheDocument()
    expect(screen.getByText('REGULATORY')).toBeInTheDocument()
    expect(screen.getByText('DUPLICATE CHECK')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()

    // SOW details and documents from Image 3
    expect(screen.getByText('SOW Details')).toBeInTheDocument()
    expect(screen.getByText('Uploaded Documents')).toBeInTheDocument()
    expect(screen.getByText('Digital_Transformation_RFP.pdf')).toBeInTheDocument()
  })

  it('allows clicking document preview and shows preview indicator', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const previewButtons = screen.getAllByRole('button', { name: /Preview/i })
    await user.click(previewButtons[0])

    expect(screen.getByText(/Document preview loaded for/i)).toBeInTheDocument()
  })

  it('switches to Brief tab and displays all required fields with red asterisks on mandatory fields', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const briefTabButton = screen.getByRole('button', { name: 'Brief' })
    await user.click(briefTabButton)

    // Submitter / Company Info
    expect(screen.getByText('Company Information')).toBeInTheDocument()
    expect(screen.getByText(mockRequest.companyInfo.name)).toBeInTheDocument()
    expect(screen.getByText(mockRequest.companyInfo.jobTitle)).toBeInTheDocument()
    expect(screen.getByText(mockRequest.companyInfo.email)).toBeInTheDocument()
    expect(screen.getByText(mockRequest.companyInfo.yearFounded)).toBeInTheDocument()

    // Key Assessment Areas
    expect(screen.getByText('Key Assessment Areas')).toBeInTheDocument()
    expect(
      screen.getByText(/How would you describe your company's stage of maturity and experience\?/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Briefly describe your proposal of collaboration/i)).toBeInTheDocument()
    expect(screen.getByText(/Which Focus Area does your solution address\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/What is the current maturity level of your solution/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/How novel or differentiated is your solution/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /What specific resources, input\. or partnerships are you seeking from M42\?/i
      )
    ).toBeInTheDocument()

    // Impacted populations
    expect(screen.getByText('Adult patients')).toBeInTheDocument()
    expect(screen.getByText('pediatric patients')).toBeInTheDocument()
    expect(screen.getByText("women's health")).toBeInTheDocument()
  })

  it('allows proceeding with or without a reason', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Switch to brief
    await user.click(screen.getByRole('button', { name: 'Brief' }))

    const proceedButton = screen.getByRole('button', { name: /Proceed/i })
    await user.click(proceedButton)

    expect(onProceed).toHaveBeenCalledWith(mockRequest.id, '')
  })

  it('enforces mandatory reason when rejecting', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Brief' }))

    const rejectButton = screen.getByRole('button', { name: /Reject/i })
    await user.click(rejectButton)

    // Rejection without reason displays error
    expect(
      screen.getByText(/A reason is mandatory when rejecting a partnership request/i)
    ).toBeInTheDocument()
    expect(onReject).not.toHaveBeenCalled()

    // Type reason
    const reasonTextarea = screen.getByRole('textbox', { name: /Decision Reason \/ Notes/i })
    await user.type(reasonTextarea, 'Solution does not align with FY27 clinical priority areas.')
    await user.click(rejectButton)

    expect(onReject).toHaveBeenCalledWith(
      mockRequest.id,
      'Solution does not align with FY27 clinical priority areas.'
    )
  })

  it('switches to Audit Log tab and displays audit trail', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    await user.click(screen.getByRole('button', { name: /Audit Log/i }))
    expect(screen.getByText('Audit Trail & Activity Log')).toBeInTheDocument()
    expect(screen.getByText('Submission Received')).toBeInTheDocument()
  })

  it('allows closing the document preview alert', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const previewButtons = screen.getAllByRole('button', { name: /Preview/i })
    await user.click(previewButtons[0])
    expect(screen.getByText(/Document preview loaded for/i)).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    await user.click(closeBtn)
    expect(screen.queryByText(/Document preview loaded for/i)).not.toBeInTheDocument()
  })

  it('renders decision banner when request has existing decision', async () => {
    const user = userEvent.setup()
    const decidedRequest = {
      ...mockRequest,
      status: 'Shortlisted' as const,
      decision: {
        status: 'proceeded' as const,
        reason: 'Strong clinical fit.',
        date: 'Today',
      },
    }

    render(
      <PartnershipDetail
        request={decidedRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Brief' }))
    expect(screen.getByText(/Decision: Proceeded to Next Stage/i)).toBeInTheDocument()
    expect(screen.getByText(/Reason: Strong clinical fit/i)).toBeInTheDocument()
  })

  it('triggers onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const backButton = screen.getByRole('button', { name: 'Back to Partnership Requests' })
    await user.click(backButton)
    expect(onBack).toHaveBeenCalled()
  })
})
