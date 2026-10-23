import { describe, it, expect } from 'vitest'
import {
  adminKpis,
  directorKpis,
  internalInterestKpis,
  sponsorKpis,
  strategyLeadKpis,
} from './roleKpis'
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

  it('counts the Partnership Admin queue, decisions this month, forwarded and rejected cases', () => {
    const now = new Date('2026-10-23T10:00:00Z')
    const decision = (action: 'proceed' | 'reject', decidedAt?: string) => ({
      action,
      reason: '',
      date: 'Just now',
      decidedAt,
    })
    const cases: PartnershipRequest[] = [
      { ...base, queue: 'admin', adminDecision: undefined },
      { ...base, queue: 'admin', adminDecision: undefined },
      { ...base, queue: 'director', adminDecision: decision('proceed', '2026-10-02T09:00:00Z') },
      { ...base, queue: 'closed', adminDecision: decision('reject', '2026-10-21T09:00:00Z') },
      { ...base, queue: 'closed', adminDecision: decision('reject', '2026-09-30T09:00:00Z') },
    ]
    expect(values(adminKpis(cases, now))).toEqual([2, 2, 1, 2])
  })

  it('counts the Director cases by their current stage', () => {
    const ok = approval('approved')
    const mk = (over: Partial<PartnershipRequest>): PartnershipRequest => ({
      ...base,
      queue: 'director',
      status: 'In Progress',
      decision: { status: 'proceeded', date: 'x' },
      ...over,
    })
    const cases: PartnershipRequest[] = [
      // Initial review waiting on the Director
      mk({ status: 'Pending', decision: undefined }),
      // Internal Canvas sent, awaiting responses
      mk({ sent: { internal: true } }),
      // Strategy declined after Internal approved: an escalation
      mk({
        sent: { internal: true, strategy: true },
        stageApprovals: { internal: ok, strategy: approval('declined') },
      }),
      // NDA & Discovery, pack ready for the Director
      mk({
        stageApprovals: { internal: ok, strategy: ok },
        alignmentPackOn: 'x',
      }),
      // NDA & Discovery already handed on: no pack left to review
      mk({
        stageApprovals: { internal: ok, strategy: ok },
        alignmentPackOn: 'x',
        discovery: { notes: [], recordings: [], proceededOn: 'x' },
      }),
      // Closed cases count nowhere
      mk({ status: 'Closed' }),
    ]
    // The escalation is in Strategic Alignment with the Strategy response in, so not "awaiting"
    expect(values(directorKpis(cases))).toEqual([2, 1, 1, 1])
  })
})
