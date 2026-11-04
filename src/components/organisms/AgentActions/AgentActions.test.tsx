import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AgentActions } from './AgentActions'
import {
  buildAdminAgentActions,
  buildAgentActions,
  getChangeFactors,
  getTypeConfidence,
} from './agentActions.data'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

describe('AgentActions', () => {
  it('lists the six checks as a divided list, not as cards', () => {
    render(<AgentActions request={request} />)
    const list = screen.getByRole('list', { name: 'Agent checks' })
    expect(list).toHaveClass('divide-y')
    ;[
      'Duplicate check',
      'Classification',
      'Maturity research',
      'KPI mapping',
      'Commodity test',
      'Initial assessment brief',
    ].forEach((title) => expect(screen.getByText(title)).toBeInTheDocument())
    screen
      .getAllByRole('listitem')
      .forEach((li) => expect(li.className).not.toMatch(/border|shadow/))
  })

  it('does not show Completed or Passed chips, only Needs attention', () => {
    render(<AgentActions request={INITIAL_PARTNERSHIP_REQUESTS[1]} />)
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    expect(screen.queryByText('Complete')).not.toBeInTheDocument()
    expect(screen.getAllByText('Needs attention').length).toBe(2)
  })

  it('shows no confidence score on any step', () => {
    const { container } = render(<AgentActions request={request} />)
    expect(container.querySelector('[aria-label*="confidence" i]')).toBeNull()
    expect(container.textContent).not.toMatch(/\d+%/)
  })

  it('shows the checks it is given instead of the default list', () => {
    render(<AgentActions request={request} actions={buildAdminAgentActions(request)} />)
    expect(screen.getByText('Applicant history')).toBeInTheDocument()
    expect(screen.queryByText('Commodity test')).not.toBeInTheDocument()
  })

  it('starts with every check expanded, then collapses and reopens one', async () => {
    const user = userEvent.setup()
    render(<AgentActions request={request} />)
    screen.getAllByRole('button').forEach((b) => expect(b).toHaveAttribute('aria-expanded', 'true'))
    expect(screen.getByText('Live cases compared')).toBeInTheDocument()
    const output = screen.getAllByText('Output')[0]
    // Output is plain text like the other findings: same label style, no fill or stroke
    expect(output.className).toBe(screen.getByText('Live cases compared').className)
    expect(output.closest('div')?.className).not.toMatch(/bg-|border/)
    await user.click(screen.getByRole('button', { name: /Duplicate check/i }))
    expect(screen.queryByText('Live cases compared')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Duplicate check/i }))
    expect(screen.getByText('Live cases compared')).toBeInTheDocument()
  })

  it('shows reviewers for KPI mapping with their match level', () => {
    render(<AgentActions request={request} />)
    expect(screen.getByText('Baseline needed to test it')).toBeInTheDocument()
    expect(screen.getByText('Suggested reviewers')).toBeInTheDocument()
    expect(screen.getByText('Riza Sayeed')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Match for .* (High|Medium|Low)/).length).toBeGreaterThan(0)
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
