import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { VendorFormResponse } from './VendorFormResponse'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('VendorFormResponse', () => {
  const request = INITIAL_PARTNERSHIP_REQUESTS[0]

  it('shows the original form read-only with contact details and every question', () => {
    render(<VendorFormResponse request={request} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Vendor Submission' })).toBeInTheDocument()
    expect(screen.getByText(/Read-only/i)).toBeInTheDocument()

    expect(screen.getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
    expect(screen.getByText('+971 50 123 4567')).toBeInTheDocument()
    expect(screen.getByText('Year Company Was Founded')).toBeInTheDocument()

    ;[
      "How would you describe your company's stage of maturity and experience?",
      'Briefly describe your proposal of collaboration.',
      'Which Focus Area does your solution address?',
      'How novel or differentiated is your solution compared to others in the market?',
      'What specific resources, input, or partnerships are you seeking from M42?',
    ].forEach((q) => expect(screen.getByText(q)).toBeInTheDocument())

    expect(screen.getByText('Product launch in 2022')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Adult patients', checked: true })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: "Women's health", checked: false })
    ).toBeInTheDocument()
    expect(screen.getByText('MedTech_Innovations_Diagnostic_RFP.pdf')).toBeInTheDocument()
  })

  it('hides the vendor contact details for reviewers', () => {
    render(<VendorFormResponse request={request} onClose={vi.fn()} hideContact />)
    expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
    expect(screen.queryByText('+971 50 123 4567')).not.toBeInTheDocument()
    expect(screen.queryByText('Email Address')).not.toBeInTheDocument()
    expect(screen.getByText('Year Company Was Founded')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('closes from the buttons and the Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<VendorFormResponse request={request} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /Close vendor submission/i }))
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('copes with optional answers missing', () => {
    const sparse = {
      ...request,
      uploadedDocuments: [],
      companyInfo: { ...request.companyInfo, phoneNumber: undefined },
      assessmentAreas: {
        ...request.assessmentAreas,
        milestones: undefined,
        relevantApprovals: undefined,
        developmentApproach: undefined,
        impactedPatientPopulations: undefined,
        clinicalAreas: undefined,
      },
    }
    render(<VendorFormResponse request={sparse} onClose={vi.fn()} />)
    expect(screen.getByText('Not provided')).toBeInTheDocument()
    expect(screen.getByText('Not applicable')).toBeInTheDocument()
    expect(screen.getByText('Not specified')).toBeInTheDocument()
    expect(screen.queryByText('Attachments')).not.toBeInTheDocument()
  })
})
