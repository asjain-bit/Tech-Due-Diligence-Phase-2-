import { describe, it, expect } from 'vitest'
import { internalInterestKpis, sponsorKpis, strategyLeadKpis } from './roleKpis'
import {
  DEFAULT_INTERNAL_INTERESTS,
  INITIAL_PARTNERSHIP_REQUESTS,
  type PartnershipRequest,
} from '@/types/partnership.types'

const base = INITIAL_PARTNERSHIP_REQUESTS[0]
const withReviewer = (status: string, decision: string): PartnershipRequest => ({
  ...base,
  internalInterests: DEFAULT_INTERNAL_INTERESTS.map((m, i) =>
    i === 0 ? { ...m, status, decision } : m
  ),
})
const approval = (status: 'approved' | 'declined') => ({ status, by: 'x', date: 'y' })
const values = (kpis: { value: number }[]) => kpis.map((k) => k.value)

describe('role KPIs', () => {
  it('counts the Internal Interest reviewer own questionnaires only', () => {
    const cases = [
      withReviewer('Pending', '-'),
      withReviewer('Completed', 'Proceed'),
      withReviewer('Completed', 'Proceed'),
      withReviewer('Completed', 'Reject'),
    ]
    expect(values(internalInterestKpis(cases))).toEqual([1, 3, 2, 1])
  })

  it('counts the Strategy Lead verdicts, leaving pending ones out of Proceed and Reject', () => {
    const cases: PartnershipRequest[] = [
      { ...base, stageApprovals: {} },
      { ...base, stageApprovals: { strategy: approval('approved') } },
      { ...base, stageApprovals: { strategy: approval('declined') } },
      { ...base, stageApprovals: { strategy: approval('approved') } },
    ]
    expect(values(strategyLeadKpis(cases))).toEqual([1, 3, 2, 1])
  })

  it('counts the sponsor cases, with no overdue count while there are no deadlines', () => {
    const cases: PartnershipRequest[] = [
      { ...base, value: { tddGeneratedOn: '22 Oct 2026' } },
      { ...base, value: {} },
      { ...base, value: {} },
      { ...base, status: 'Closed' },
    ]
    expect(values(sponsorKpis(cases))).toEqual([4, 2, 1, 0])
  })
})
