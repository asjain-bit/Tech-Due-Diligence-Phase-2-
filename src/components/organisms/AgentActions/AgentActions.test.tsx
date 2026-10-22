import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { AgentActions } from './AgentActions'
import { AGENT_CONTEXT_SOURCES, buildAgentActions, getChangeFactors } from './agentActions.data'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

describe('AgentActions (finished checklist)', () => {
  it('lists the six checks and the context the agent read', () => {
    render(<AgentActions request={request} />)
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    ;[
      'Duplicate check',
      'Classification',
      'Maturity research',
      'KPI mapping',
      'Commodity test',
      'Initial assessment brief',
    ].forEach((title) => expect(screen.getByText(title)).toBeInTheDocument())
    AGENT_CONTEXT_SOURCES.forEach((source) => expect(screen.getByText(source)).toBeInTheDocument())
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows how many checks need attention', () => {
    render(<AgentActions request={INITIAL_PARTNERSHIP_REQUESTS[1]} />)
    expect(screen.getByText('2 needs attention')).toBeInTheDocument()
  })

  it('expands a check to show its findings and output', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: /Duplicate check/i }))
    expect(screen.getByText('Live cases compared')).toBeInTheDocument()
    expect(screen.getByText('Output')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Duplicate check/i }))
    expect(screen.queryByText('Live cases compared')).not.toBeInTheDocument()
  })

  it('shows confidence, baseline and suggested reviewers for KPI mapping', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: /KPI mapping/i }))
    expect(screen.getByText('Baseline needed to test it')).toBeInTheDocument()
    expect(screen.getByText('Suggested reviewers')).toBeInTheDocument()
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Confidence \d+%/).length).toBeGreaterThan(0)
  })
})

describe('AgentActions (animated run)', () => {
  afterEach(() => vi.useRealTimers())

  const runTimers = (seconds: number) => {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }
  }

  it('reads the context, runs each check in turn and then completes once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<AgentActions request={request} animate onComplete={onComplete} />)

    expect(
      screen.getByText(/Reviewing the submission from MedTech Innovations/)
    ).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem').filter((li) => li.dataset.state)
    // First context source is running, every check is waiting and cannot be opened
    expect(rows[0]).toHaveAttribute('data-state', 'running')
    expect(screen.getByRole('button', { name: /Duplicate check/i })).toBeDisabled()
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(12)
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Duplicate check/i })).toBeEnabled()
    expect(onComplete).toHaveBeenCalledTimes(1)
    runTimers(3)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('can be skipped to the finished state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onComplete = vi.fn()
    render(<AgentActions request={request} animate onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('skips the animation when the user prefers reduced motion', () => {
    const original = window.matchMedia
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const onComplete = vi.fn()
    render(<AgentActions request={request} animate onComplete={onComplete} />)
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
    window.matchMedia = original
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
        'commodity',
        'brief',
      ])
      actions.forEach((a) => {
        expect(a.output.length).toBeGreaterThan(10)
        expect(a.runningText.length).toBeGreaterThan(5)
      })
      expect(getChangeFactors(r)).toHaveLength(3)
    })
  })

  it('treats the vendor self-declared route as a claim', () => {
    const classification = buildAgentActions(request).find((a) => a.id === 'classification')!
    expect(classification.findings.find((f) => f.label === 'Vendor self-declared')?.value).toMatch(
      /treated as a claim/
    )
  })

  it('flags problems and falls back for unknown requests', () => {
    const base = INITIAL_PARTNERSHIP_REQUESTS[1]
    const risky = {
      ...base,
      id: 'req-unknown',
      solutionMaturity: 'Concept',
      companyInfo: { ...base.companyInfo, location: undefined },
      internalInterests: undefined,
      agentRecommendation: { ...base.agentRecommendation!, status: 'reject' as const },
      overviewCards: {
        ...base.overviewCards,
        duplicateCheck: 'Possible match',
        regulatory: 'Unclear',
      },
    }
    const byId = Object.fromEntries(buildAgentActions(risky).map((a) => [a.id, a]))
    expect(byId.duplicate.status).toBe('attention')
    expect(byId.maturity.status).toBe('attention')
    expect(byId.commodity.status).toBe('attention')
    expect(byId.brief.headline).toBe('Recommends Reject')
    expect(byId.kpi.stakeholders).toEqual([])
  })
})
