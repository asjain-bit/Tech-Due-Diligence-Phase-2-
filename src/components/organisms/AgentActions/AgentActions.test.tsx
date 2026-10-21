import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AgentActions } from './AgentActions'
import { buildAgentActions } from './agentActions.data'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('AgentActions', () => {
  const request = INITIAL_PARTNERSHIP_REQUESTS[0]

  it('lists all seven agent steps collapsed with a headline', () => {
    render(<AgentActions request={request} />)
    expect(screen.getAllByRole('listitem').length).toBe(7)
    expect(screen.getByText('No duplicate found')).toBeInTheDocument()
    screen.getAllByRole('button', { expanded: false }).forEach((b) => {
      expect(b).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('expands a step to show what was checked, findings and output', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: /Baseline Needed to Test/i }))
    expect(screen.getByText(/What the agent checked:/i)).toBeInTheDocument()
    expect(screen.getByText('Pass threshold')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('shows confidence and suggested reviewers for KPI mapping', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: /KPI Mapping/i }))
    expect(screen.getByText('Suggested reviewers')).toBeInTheDocument()
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Confidence \d+%/).length).toBeGreaterThan(0)
  })

  it('expands and collapses everything', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getAllByText('Output').length).toBe(7)
    await user.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(screen.queryByText('Output')).not.toBeInTheDocument()
    const first = screen.getAllByRole('listitem')[0]
    expect(within(first).getByText('Duplicate Check')).toBeInTheDocument()
  })
})

describe('buildAgentActions', () => {
  it('has request-specific content for every seeded request', () => {
    INITIAL_PARTNERSHIP_REQUESTS.forEach((r) => {
      const actions = buildAgentActions(r)
      expect(actions.map((a) => a.id)).toEqual([
        'duplicate',
        'classification',
        'maturity',
        'kpi',
        'baseline',
        'commodity',
        'brief',
      ])
      actions.forEach((a) => expect(a.output.length).toBeGreaterThan(10))
    })
  })

  it('flags problems and falls back for unknown requests', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    const risky = {
      ...base,
      id: 'req-unknown',
      solutionMaturity: 'Concept',
      tags: undefined,
      internalInterests: undefined,
      agentRecommendation: { ...base.agentRecommendation!, status: 'reject' as const },
      overviewCards: {
        ...base.overviewCards,
        duplicateCheck: 'Possible match',
        regulatory: 'Unclear',
      },
    }
    const actions = buildAgentActions(risky)
    const byId = Object.fromEntries(actions.map((a) => [a.id, a]))
    expect(byId.duplicate.status).toBe('attention')
    expect(byId.maturity.status).toBe('attention')
    expect(byId.commodity.status).toBe('attention')
    expect(byId.brief.headline).toBe('Recommends Reject')
    expect(byId.kpi.stakeholders).toEqual([])
  })
})
