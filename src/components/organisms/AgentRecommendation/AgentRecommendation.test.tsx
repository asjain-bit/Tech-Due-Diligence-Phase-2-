import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AgentRecommendation } from './AgentRecommendation'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('AgentRecommendation', () => {
  it('shows verdict, confidence, reasoning and the signals weighed', () => {
    render(<AgentRecommendation request={INITIAL_PARTNERSHIP_REQUESTS[0]} />)
    expect(screen.getByText('Proceed to the next stage')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText(/AI evaluation confirms high clinical validation/i)).toBeInTheDocument()
    ;['Evidence', 'Deployment', 'Regulatory', 'Duplicate check'].forEach((l) =>
      expect(screen.getByText(l)).toBeInTheDocument()
    )
    expect(
      screen.getByText(/a reason is required for both Proceed and Reject/i)
    ).toBeInTheDocument()
  })

  it('handles a reject verdict with medium confidence and unclear signals', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    render(
      <AgentRecommendation
        request={{
          ...base,
          agentRecommendation: { ...base.agentRecommendation!, status: 'reject', confidence: 60 },
        }}
      />
    )
    expect(screen.getByText('Reject this request')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('shows low confidence and renders nothing without a recommendation', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    const { rerender, container } = render(
      <AgentRecommendation
        request={{
          ...base,
          agentRecommendation: { ...base.agentRecommendation!, confidence: 30 },
        }}
      />
    )
    expect(screen.getByText('Low')).toBeInTheDocument()
    rerender(<AgentRecommendation request={{ ...base, agentRecommendation: undefined }} />)
    expect(container).toBeEmptyDOMElement()
  })
})
