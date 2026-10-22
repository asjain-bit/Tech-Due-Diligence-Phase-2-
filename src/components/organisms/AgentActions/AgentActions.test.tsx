import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { AgentActions } from './AgentActions'
import {
  AGENT_CONTEXT_SOURCES,
  buildAdminAgentActions,
  buildAgentActions,
  getChangeFactors,
  getTypeConfidence,
} from './agentActions.data'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

describe('AgentActions (finished checklist)', () => {
  it('lists the six checks and the context the agent read', () => {
    render(<AgentActions request={request} />)
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

  it('does not show Completed or Passed chips, only Needs attention', () => {
    render(<AgentActions request={INITIAL_PARTNERSHIP_REQUESTS[1]} />)
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    expect(screen.queryByText('Complete')).not.toBeInTheDocument()
    expect(screen.getAllByText('Needs attention').length).toBe(2)
  })

  it('can hide the heading and the context row for the drawer', () => {
    render(<AgentActions request={request} showHeader={false} showSources={false} />)
    expect(screen.queryByRole('heading', { name: 'Agent Actions' })).not.toBeInTheDocument()
    expect(screen.queryByText('Reading')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Agent checks')).toBeInTheDocument()
  })

  it('shows the checks it is given instead of the default list', () => {
    const actions = buildAdminAgentActions(request)
    render(<AgentActions request={request} actions={actions} showSources={false} />)
    expect(screen.getByText('Applicant history')).toBeInTheDocument()
    expect(screen.queryByText('Commodity test')).not.toBeInTheDocument()
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

  it('shows confidence as a level, never a percentage', async () => {
    const user = userEvent.setup()
    const { container } = render(<AgentActions request={request} />)
    await user.click(screen.getByRole('button', { name: /KPI mapping/i }))
    expect(screen.getByText('Baseline needed to test it')).toBeInTheDocument()
    expect(screen.getByText('Suggested reviewers')).toBeInTheDocument()
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Confidence (High|Medium|Low)/).length).toBeGreaterThan(0)
    expect(container.textContent).not.toMatch(/\d+%/)
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
    expect(rows[0]).toHaveAttribute('data-state', 'running')
    expect(screen.getByRole('button', { name: /Duplicate check/i })).toBeDisabled()
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(12)
    expect(screen.getByText(/Analysis complete/)).toBeInTheDocument()
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
    expect(screen.getByText(/Analysis complete/)).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('skips the animation when the user prefers reduced motion', () => {
    const original = window.matchMedia
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const onComplete = vi.fn()
    render(<AgentActions request={request} animate onComplete={onComplete} />)
    expect(screen.getByText(/Analysis complete/)).toBeInTheDocument()
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
        a.findings
          .filter((f) => f.label === 'Confidence')
          .forEach((f) => expect(f.value).toMatch(/^(High|Medium|Low)$/))
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

describe('buildAdminAgentActions', () => {
  it('covers the Partnership Admin checks in order', () => {
    const actions = buildAdminAgentActions(request)
    expect(actions.map((a) => a.id)).toEqual([
      'applicant',
      'duplicate',
      'backlog',
      'service-line',
      'uae-maturity',
      'screening',
      'brief',
    ])
    expect(actions.find((a) => a.id === 'uae-maturity')!.findings.at(-1)?.label).toBe(
      'Overall score'
    )
  })

  it('marks a vendor as re-applying from history or from the pipeline', () => {
    const history = buildAdminAgentActions(INITIAL_PARTNERSHIP_REQUESTS[2]).find(
      (a) => a.id === 'applicant'
    )!
    expect(history.headline).toBe('Re-applying')
    expect(history.status).toBe('attention')

    const twin = { ...request, id: 'req-new', requestCode: 'PR-200' }
    const found = buildAdminAgentActions(twin, [request]).filter((a) =>
      ['applicant', 'duplicate'].includes(a.id)
    )
    expect(found.map((a) => a.status)).toEqual(['attention', 'attention'])

    const fresh = buildAdminAgentActions(request, INITIAL_PARTNERSHIP_REQUESTS).find(
      (a) => a.id === 'applicant'
    )!
    expect(fresh.headline).toBe('Fresh application')
  })

  it('flags CoE backlog overlap, weak UAE maturity and adverse media', () => {
    const byId = (r: (typeof INITIAL_PARTNERSHIP_REQUESTS)[number]) =>
      Object.fromEntries(buildAdminAgentActions(r).map((a) => [a.id, a]))
    expect(byId(INITIAL_PARTNERSHIP_REQUESTS[1]).backlog.status).toBe('attention')
    expect(byId(INITIAL_PARTNERSHIP_REQUESTS[1])['uae-maturity'].status).toBe('attention')
    expect(byId(INITIAL_PARTNERSHIP_REQUESTS[3]).screening.status).toBe('attention')
    expect(byId(INITIAL_PARTNERSHIP_REQUESTS[0]).backlog.status).toBe('passed')
  })

  it('falls back for unknown requests', () => {
    const unknown = {
      ...request,
      id: 'req-unknown',
      requestCode: 'PR-300',
      companyName: 'Brand New Co',
    }
    expect(buildAdminAgentActions(unknown)).toHaveLength(7)
  })
})

describe('getTypeConfidence', () => {
  it('gives a level for every case type', () => {
    INITIAL_PARTNERSHIP_REQUESTS.forEach((r) => {
      const c = getTypeConfidence(r)
      expect(Object.keys(c).sort()).toEqual(['M&A', 'Partnership', 'Procure'])
      Object.values(c).forEach((level) => expect(['High', 'Medium', 'Low']).toContain(level))
    })
    expect(getTypeConfidence({ ...request, id: 'x' }).Partnership).toBe('High')
  })
})
