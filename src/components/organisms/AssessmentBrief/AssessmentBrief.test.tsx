import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AssessmentBrief } from './AssessmentBrief'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

describe('AssessmentBrief', () => {
  it('writes the brief from the data the vendor filled in', () => {
    render(<AssessmentBrief request={request} onViewVendorResponse={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
    expect(screen.getByText('AI-generated')).toBeInTheDocument()
    expect(
      screen.getByText(/MedTech Innovations was founded in 2018 \(UAE, Dubai\)/)
    ).toBeInTheDocument()
    expect(screen.getByText(/at Pilot maturity/)).toBeInTheDocument()

    // Highlights come straight from the form answers
    expect(
      screen.getByText(request.assessmentAreas.productPlatformServiceDetails)
    ).toBeInTheDocument()
    expect(screen.getByText('Medical Imaging')).toBeInTheDocument()
    expect(screen.getByText(request.assessmentAreas.noveltyAndDifferentiation)).toBeInTheDocument()
    expect(screen.getByText(/Adult Patients, Pediatric Patients, Oncology/)).toBeInTheDocument()

    // Asks and track record
    expect(screen.getByText('Clinical sandbox integration with M42 Epic EHR')).toBeInTheDocument()
    expect(screen.getByText('Joint research publication')).toBeInTheDocument()
    expect(screen.getByText('Product launch in 2022')).toBeInTheDocument()
  })

  it('shows the agent verdict and the three things that would change it', () => {
    render(<AssessmentBrief request={request} onViewVendorResponse={vi.fn()} />)
    expect(screen.getByText('Agent verdict')).toBeInTheDocument()
    expect(screen.getByText(/recommends proceeding to internal review/i)).toBeInTheDocument()
    expect(screen.getByText('High · 94%')).toBeInTheDocument()
    expect(screen.getByText(request.agentRecommendation!.rationale)).toBeInTheDocument()
    expect(
      screen.getByText(/Three things that would change this recommendation/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('Clinical validation not reproduced on M42 patient data')
    ).toBeInTheDocument()
  })

  it('handles a reject verdict and sparse form data', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    render(
      <AssessmentBrief
        onViewVendorResponse={vi.fn()}
        request={{
          ...base,
          companyInfo: { ...base.companyInfo, location: undefined },
          agentRecommendation: { ...base.agentRecommendation!, status: 'reject', confidence: 40 },
          assessmentAreas: {
            ...base.assessmentAreas,
            milestones: undefined,
            relevantApprovals: undefined,
            regulatoryApprovalList: undefined,
            developmentApproach: undefined,
            impactedPatientPopulations: undefined,
            clinicalAreas: undefined,
          },
        }}
      />
    )
    expect(screen.getByText(/recommends rejecting this request/i)).toBeInTheDocument()
    expect(screen.getByText('Low · 40%')).toBeInTheDocument()
    expect(screen.getByText('Not applicable')).toBeInTheDocument()
    expect(screen.getByText('Not specified')).toBeInTheDocument()
    expect(screen.queryByText('Track record')).not.toBeInTheDocument()
    expect(screen.queryByText('Who it affects')).not.toBeInTheDocument()
  })

  it('opens the vendor response and renders step actions below the brief', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    render(
      <AssessmentBrief request={request} onViewVendorResponse={onView}>
        <button>Step action</button>
      </AssessmentBrief>
    )
    await user.click(screen.getByRole('button', { name: /View vendor response/i }))
    expect(onView).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Step action' })).toBeInTheDocument()
  })

  it('renders without a recommendation', () => {
    render(
      <AssessmentBrief
        request={{ ...request, agentRecommendation: undefined }}
        onViewVendorResponse={vi.fn()}
      />
    )
    expect(screen.queryByText('Agent verdict')).not.toBeInTheDocument()
  })
})
