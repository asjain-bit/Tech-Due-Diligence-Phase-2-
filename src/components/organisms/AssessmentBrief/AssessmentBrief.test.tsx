import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AssessmentBrief } from './AssessmentBrief'
import { buildAgentActions } from '@/components/organisms/AgentActions'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

const renderBrief = (props: Partial<React.ComponentProps<typeof AssessmentBrief>> = {}) =>
  render(
    <AssessmentBrief
      request={request}
      actions={buildAgentActions(request)}
      onViewVendorResponse={vi.fn()}
      onOpenAnalysis={vi.fn()}
      {...props}
    />
  )

describe('AssessmentBrief', () => {
  it('splits the brief into sections with a side panel to navigate them', () => {
    renderBrief()
    const nav = within(screen.getByRole('navigation', { name: 'Brief sections' }))
    ;[
      'Agent Verdict',
      'Company Information',
      'Company Experience',
      'Collaboration Proposal',
      'Focus Area',
      'Solution Maturity',
      'Regulatory Approvals',
      'Innovation & Differentiation',
      'Development Approach',
      'Support from M42',
      'Target Population & Impact',
    ].forEach((label) => expect(nav.getByRole('button', { name: label })).toBeInTheDocument())
    expect(nav.queryByRole('button', { name: 'Your Decision' })).not.toBeInTheDocument()
  })

  it('shows the form answers in each section', () => {
    renderBrief()
    const a = request.assessmentAreas
    expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
    expect(screen.getByText('AI-generated')).toBeInTheDocument()
    expect(screen.getByText('sarah@medtechinnovations.com')).toBeInTheDocument()
    expect(screen.getByText(a.stageOfMaturityAndExperience)).toBeInTheDocument()
    expect(screen.getByText('Product launch in 2022')).toBeInTheDocument()
    expect(screen.getByText(a.proposalOfCollaboration)).toBeInTheDocument()
    expect(screen.getByText(a.productPlatformServiceDetails)).toBeInTheDocument()
    expect(screen.getByText('Medical Imaging')).toBeInTheDocument()
    expect(
      screen.getByText('FDA cleared, CE Mark approved, UAE MOHAP registered.')
    ).toBeInTheDocument()
    expect(screen.getByText(a.noveltyAndDifferentiation)).toBeInTheDocument()
    expect(screen.getByText(a.requestedM42Resources)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '10. Target Patient Population & Impact' })
    ).toBeInTheDocument()
    expect(screen.getByText('Oncology')).toBeInTheDocument()
  })

  it('hides personal contact details for reviewers', () => {
    renderBrief({ hideContact: true })
    expect(screen.queryByText('sarah@medtechinnovations.com')).not.toBeInTheDocument()
    expect(screen.queryByText('Contact Person Name')).not.toBeInTheDocument()
    expect(screen.getByText('Year Company Was Founded')).toBeInTheDocument()
  })

  it('shows the agent verdict as a level, with no percentage', () => {
    const { container } = renderBrief()
    expect(screen.getByText('Recommends proceeding')).toBeInTheDocument()
    expect(screen.getByText('High confidence')).toBeInTheDocument()
    expect(
      screen.getByText(/Three things that would change this recommendation/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('Clinical validation not reproduced on M42 patient data')
    ).toBeInTheDocument()
    // the vendor rationale mentions figures, the verdict itself must not show a confidence percentage
    expect(screen.queryByText(/94%/)).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/High · \d+%/)
  })

  it('summarises the AI analysis and opens it', async () => {
    const user = userEvent.setup()
    const onOpenAnalysis = vi.fn()
    renderBrief({ onOpenAnalysis })
    expect(screen.getByText('AI analysis completed')).toBeInTheDocument()
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /View checks and findings/i }))
    expect(onOpenAnalysis).toHaveBeenCalled()
  })

  it('counts risks from the checks that need attention', () => {
    const second = INITIAL_PARTNERSHIP_REQUESTS[1]
    renderBrief({ request: second, actions: buildAgentActions(second) })
    expect(screen.getByText('6 checks completed · 2 risks identified')).toBeInTheDocument()
  })

  it('has the eye icon on the left of View vendor response and opens it', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderBrief({ onViewVendorResponse: onView })
    const button = screen.getByRole('button', { name: /View vendor response/i })
    expect(button.firstElementChild).toHaveClass('lucide-eye')
    expect(button.lastElementChild).not.toHaveClass('lucide-external-link')
    await user.click(button)
    expect(onView).toHaveBeenCalled()
  })

  it('adds a decision section and a footer when given', () => {
    renderBrief({ decision: <p>Decision form</p>, footer: <button>Step action</button> })
    const nav = within(screen.getByRole('navigation', { name: 'Brief sections' }))
    expect(nav.getByRole('button', { name: 'Your Decision' })).toBeInTheDocument()
    expect(screen.getByText('Decision form')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Step action' })).toBeInTheDocument()
  })

  it('navigates with the side panel', async () => {
    const user = userEvent.setup()
    renderBrief()
    const nav = within(screen.getByRole('navigation', { name: 'Brief sections' }))
    await user.click(nav.getByRole('button', { name: 'Focus Area' }))
    expect(nav.getByRole('button', { name: 'Focus Area' })).toHaveAttribute('aria-current', 'true')
  })

  it('handles a reject verdict and sparse form data', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    renderBrief({
      request: {
        ...base,
        companyInfo: { ...base.companyInfo, location: undefined },
        agentRecommendation: { ...base.agentRecommendation!, status: 'reject', confidence: 40 },
        assessmentAreas: {
          ...base.assessmentAreas,
          growthJourneyAndRegionalExperience: undefined,
          milestones: undefined,
          relevantApprovals: undefined,
          regulatoryApprovalList: undefined,
          developmentApproach: undefined,
          impactedPatientPopulations: undefined,
          clinicalAreas: undefined,
          productPlatformServiceDetails: base.assessmentAreas.proposalOfCollaboration,
        },
      },
      actions: [],
    })
    expect(screen.getByText('Recommends rejecting this request')).toBeInTheDocument()
    expect(screen.getByText('Low confidence')).toBeInTheDocument()
    expect(screen.getByText('Not applicable')).toBeInTheDocument()
    expect(screen.getByText('Not specified')).toBeInTheDocument()
    expect(screen.queryByText('Key milestones')).not.toBeInTheDocument()
    expect(screen.queryByText('Product, Platform & Service Details')).not.toBeInTheDocument()
  })

  it('renders without a recommendation', () => {
    renderBrief({ request: { ...request, agentRecommendation: undefined } })
    expect(screen.queryByText('Recommends proceeding')).not.toBeInTheDocument()
  })
})
