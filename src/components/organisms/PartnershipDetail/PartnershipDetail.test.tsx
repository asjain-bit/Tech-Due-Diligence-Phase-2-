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

  it('renders header card and overview tab matching Image 2', () => {
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    // Header info matching Image 2
    expect(screen.getByText('MedTech Innovations')).toBeInTheDocument()
    expect(screen.getByText('Pending Director Review')).toBeInTheDocument()
    expect(
      screen.getByText(/AI-powered diagnostic platform for early disease detection/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Sarah Ahmed')).toBeInTheDocument()
    expect(screen.getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
    expect(screen.getByText('+971 50 123 4567')).toBeInTheDocument()
    expect(screen.getByText('Founded in 2018')).toBeInTheDocument()
    expect(screen.getByText('UAE, Dubai')).toBeInTheDocument()

    // Overview section: Workflow Progress with 7 stages
    expect(screen.getByText('Workflow Progress')).toBeInTheDocument()
    expect(screen.getByText('1. Submission')).toBeInTheDocument()
    expect(screen.getByText('2. Intake & Triage')).toBeInTheDocument()
    expect(screen.getByText('3. Screening & Fit')).toBeInTheDocument()
    expect(screen.getByText('4. NDA & Discovery')).toBeInTheDocument()
    expect(screen.getByText('5. Value Assessment')).toBeInTheDocument()
    expect(screen.getByText('6. Due Diligence')).toBeInTheDocument()
    expect(screen.getByText('7. Term Sheet & Pilot')).toBeInTheDocument()

    // Solution Overview & tags
    expect(screen.getByText('Solution Overview')).toBeInTheDocument()
    expect(
      screen.getByText(/MedTech Innovations has proposed an AI-powered diagnostic platform/i)
    ).toBeInTheDocument()
    expect(screen.getByText('Medical Imaging')).toBeInTheDocument()
    expect(screen.getByText('Clinical Decision Support')).toBeInTheDocument()

    // Key Information with 6 items
    expect(screen.getByText('Key Information')).toBeInTheDocument()
    expect(screen.getByText('Focus Area(s)')).toBeInTheDocument()
    expect(screen.getByText('Solution Maturity')).toBeInTheDocument()
    expect(screen.getByText('Regulatory Approvals')).toBeInTheDocument()
    expect(screen.getByText('Patient Population')).toBeInTheDocument()
    expect(screen.getByText('Clinical Area(s)')).toBeInTheDocument()
    expect(screen.getByText('Development Approach')).toBeInTheDocument()
  })

  it('switches to Partnership Brief tab matching Image 3 with sidebar navigation and sections', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const briefTabButton = screen.getByRole('button', { name: /Partnership Brief/i })
    await user.click(briefTabButton)

    // Sidebar navigation menu items
    expect(screen.getByRole('button', { name: /Company Information/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Company Experience/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Collaboration Proposal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Focus Area/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Solution Maturity/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Regulatory Approvals/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Innovation & Differentiation/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Development Approach/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Support from M42/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Target Population & Impact/i })).toBeInTheDocument()

    // Section 1: Company Information
    expect(screen.getByText('1. Company Information')).toBeInTheDocument()
    expect(screen.getAllByText('Business Development Director').length).toBeGreaterThanOrEqual(1)

    // Section 2: Stage of Maturity and Milestones
    expect(screen.getByText(/2. Company's Stage of Maturity and Experience/i)).toBeInTheDocument()
    expect(screen.getByText(/Deployment in 10\+ hospitals across UAE/i)).toBeInTheDocument()

    // Nav clicking does not crash
    await user.click(screen.getByRole('button', { name: /Company Experience/i }))
  })

  it('allows proceeding with optional reason through modal', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const proceedButton = screen.getByRole('button', { name: /^Proceed$/i })
    await user.click(proceedButton)

    // Modal is opened
    expect(screen.getByText('Proceed to Next Stage')).toBeInTheDocument()
    const reasonInput = screen.getByRole('textbox', { name: /Decision Notes/i })
    await user.type(reasonInput, 'Strong strategic fit for FY27.')

    const confirmProceed = screen.getByRole('button', { name: /Confirm & Proceed/i })
    await user.click(confirmProceed)

    expect(onProceed).toHaveBeenCalledWith(mockRequest.id, 'Strong strategic fit for FY27.')
  })

  it('enforces mandatory reason when rejecting through modal', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const rejectButton = screen.getByRole('button', { name: /^Reject$/i })
    await user.click(rejectButton)

    // Modal is opened
    expect(screen.getByText('Reject Partnership Request')).toBeInTheDocument()

    // Try without reason
    const confirmReject = screen.getByRole('button', { name: /Confirm Rejection/i })
    await user.click(confirmReject)

    expect(
      screen.getByText(/A reason is mandatory when rejecting a partnership request/i)
    ).toBeInTheDocument()
    expect(onReject).not.toHaveBeenCalled()

    // Enter reason and submit
    const reasonInput = screen.getByRole('textbox', { name: /Rejection Reason/i })
    await user.type(reasonInput, 'Solution does not align with FY27 clinical priority areas.')
    await user.click(confirmReject)

    expect(onReject).toHaveBeenCalledWith(
      mockRequest.id,
      'Solution does not align with FY27 clinical priority areas.'
    )
  })

  it('renders decision banner when request has existing decision', () => {
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

    expect(screen.getByText(/Status: Approved to Proceed/i)).toBeInTheDocument()
    expect(screen.getByText(/Director Notes: Strong clinical fit/i)).toBeInTheDocument()
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
