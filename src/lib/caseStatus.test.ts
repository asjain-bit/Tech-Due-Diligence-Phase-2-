import { describe, it, expect } from 'vitest'
import { getDisplayStatus } from './caseStatus'
import {
  DEFAULT_INTERNAL_INTERESTS,
  INITIAL_PARTNERSHIP_REQUESTS,
  type PartnershipRequest,
} from '@/types/partnership.types'

const [medtech, alpha, genomic, , neuro] = INITIAL_PARTNERSHIP_REQUESTS
const ok = { status: 'approved' as const, by: 'x', date: 'y' }

describe('getDisplayStatus', () => {
  it('is Pending for whoever the case waits on, In Progress for everyone else', () => {
    // A new brief waits on the Director; the Admin has already passed it on
    expect(getDisplayStatus(medtech, 'director')).toBe('Pending')
    expect(getDisplayStatus(medtech, 'admin')).toBe('In Progress')
    // A brand new request waits on the Admin
    expect(getDisplayStatus(neuro, 'admin')).toBe('Pending')
    expect(getDisplayStatus(neuro, 'director')).toBe('In Progress')
    // Strategic Alignment sent to Strategy: Strategy is pending, the Director is not
    const awaitingStrategy: PartnershipRequest = {
      ...alpha,
      sent: { internal: true, strategy: true },
      stageApprovals: { internal: ok },
    }
    expect(getDisplayStatus(awaitingStrategy, 'strategy')).toBe('Pending')
    expect(getDisplayStatus(awaitingStrategy, 'director')).toBe('In Progress')
    // NDA & Discovery is the Director's; Value & Due Diligence is the sponsor's
    expect(getDisplayStatus(genomic, 'director')).toBe('Pending')
    const atValue: PartnershipRequest = {
      ...genomic,
      discovery: { notes: [], recordings: [], proceededOn: 'x' },
    }
    expect(getDisplayStatus(atValue, 'sponsor')).toBe('Pending')
    expect(getDisplayStatus(atValue, 'director')).toBe('In Progress')
  })

  it('is Internal Interest pending until that reviewer has submitted', () => {
    const reviewers = DEFAULT_INTERNAL_INTERESTS
    const sent = (status: string): PartnershipRequest => ({
      ...medtech,
      status: 'In Progress',
      decision: { status: 'proceeded', date: 'x' },
      sent: { internal: true },
      internalInterests: reviewers.map((m, i) => (i === 0 ? { ...m, status } : m)),
    })
    expect(getDisplayStatus(sent('Pending'), 'internal')).toBe('Pending')
    expect(getDisplayStatus(sent('Pending'), 'director')).toBe('In Progress')
    expect(getDisplayStatus(sent('Completed'), 'internal')).toBe('In Progress')
  })

  it('shows Completed, Closed and RFI for every role', () => {
    const done: PartnershipRequest = {
      ...genomic,
      discovery: { notes: [], recordings: [], proceededOn: 'x' },
      value: { tddGeneratedOn: 'x' },
    }
    expect(getDisplayStatus(done, 'sponsor')).toBe('Completed')
    expect(getDisplayStatus(done, 'admin')).toBe('Completed')
    expect(getDisplayStatus({ ...medtech, status: 'Closed' }, 'director')).toBe('Closed')
    expect(getDisplayStatus({ ...medtech, status: 'Exited' }, 'admin')).toBe('Closed')
    expect(getDisplayStatus({ ...medtech, status: 'Information Requested' }, 'director')).toBe(
      'RFI'
    )
  })
})
