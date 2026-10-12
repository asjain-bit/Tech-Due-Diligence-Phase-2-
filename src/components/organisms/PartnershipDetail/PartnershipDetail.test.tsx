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
    expect(screen.getByText('Pending Director Review')).toBeInTheDocument()

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
    expect(screen.getByText('Dr. Fatima Al Mansoori')).toBeInTheDocument()
  })

  it('renders overview inside single large box with workflow without numbers and highlighted Agent Recommendation', () => {
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
    expect(screen.getByText('Initial Review')).toBeInTheDocument()
    expect(screen.getByText('Internal Interest')).toBeInTheDocument()
    expect(screen.getByText('Evaluation')).toBeInTheDocument()
    expect(screen.getByText('Strategy Alignment')).toBeInTheDocument()
    expect(screen.getByText('Legal & Sponsor Review')).toBeInTheDocument()

    // Numbers 1., 2., 3. removed from step titles
    expect(screen.queryByText('1. Initial Review')).not.toBeInTheDocument()
    expect(screen.queryByText('2. Internal Interest')).not.toBeInTheDocument()

    // Agent Recommendation highlighted banner
    expect(screen.getByText('Agent Recommendation')).toBeInTheDocument()
    expect(screen.getByText(/Recommended to Proceed \(94% Match\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Clinical Fit:/i)).toBeInTheDocument()
    expect(screen.getByText(/Regulatory Approval:/i)).toBeInTheDocument()
    expect(screen.getByText(/Architecture:/i)).toBeInTheDocument()

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

  it('switches to Partnership Brief tab and navigates sections', async () => {
    const user = userEvent.setup()
    render(
      <PartnershipDetail
        request={mockRequest}
        onBack={onBack}
        onProceed={onProceed}
        onReject={onReject}
      />
    )

    const briefTab = screen.getByRole('button', { name: /Partnership Brief/i })
    await user.click(briefTab)

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

    // Switch to Internal Interest tab
    const internalTab = screen.getByRole('button', { name: /Internal Interest/i })
    await user.click(internalTab)

    // Heading without icon and subtitle
    expect(screen.getByRole('heading', { level: 2, name: 'Internal Interest' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Manage internal stakeholders who will review this partnership based on their domain expertise.'
      )
    ).toBeInTheDocument()

    // + Add Interest button with custom tooltip
    expect(screen.getByRole('button', { name: /Add Interest/i })).toBeInTheDocument()
    expect(screen.getByText('Add up to 5 people')).toBeInTheDocument()

    // Table renders stakeholders from Image 1
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getByText('Head of AI & Analytics')).toBeInTheDocument()
    expect(screen.getByText('Parag Agarwal')).toBeInTheDocument()
    expect(screen.getByText('Radiology & Imaging Lead')).toBeInTheDocument()
    expect(screen.getByText('Najla Al Mansoori')).toBeInTheDocument()
    expect(screen.getByText('Khalid Al Zaabi')).toBeInTheDocument()
    expect(screen.getByText('Sara Malik')).toBeInTheDocument()

    // Click Delete on one stakeholder
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    await user.click(deleteButtons[0])

    // SOW-style Delete confirmation modal
    expect(screen.getByText('Remove Stakeholder')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument()

    // Confirm delete
    const modalDeleteBtn = screen.getByRole('button', { name: 'Delete' })
    await user.click(modalDeleteBtn)
    expect(screen.queryByText('Riza Sayeed')).not.toBeInTheDocument()

    // Add new stakeholder
    const addBtn = screen.getByRole('button', { name: /Add Interest/i })
    await user.click(addBtn)

    expect(screen.getByText('Add Internal Stakeholder')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText(/Dr\. Fatima/i), 'Dr. Mona Al Hashimi')
    await user.type(screen.getByPlaceholderText(/Head of AI/i), 'Chief Medical Officer')
    await user.type(screen.getByPlaceholderText(/Medical Imaging/i), 'Clinical Governance')
    await user.type(screen.getByPlaceholderText(/Clinical Validation/i), 'Health Policy')

    const confirmAddBtn = screen.getByRole('button', { name: 'Add Stakeholder' })
    await user.click(confirmAddBtn)

    expect(screen.getByText('Dr. Mona Al Hashimi')).toBeInTheDocument()
    expect(screen.getByText('Chief Medical Officer')).toBeInTheDocument()
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
})
