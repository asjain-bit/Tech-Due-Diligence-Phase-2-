import { getStageLabel } from '@/lib/caseActions'
import { needsDirectorDecision } from '@/lib/caseStatus'
import { DEFAULT_INTERNAL_INTERESTS, type PartnershipRequest } from '@/types/partnership.types'

export interface RoleKpi {
  title: string
  caption: string
  value: number
}

const isTerminal = (r: PartnershipRequest) => r.status === 'Closed' || r.status === 'Exited'

/** The logged-in Internal Interest reviewer is the first reviewer on every case sent to the team */
const internalReviewer = (r: PartnershipRequest) =>
  (r.internalInterests?.length ? r.internalInterests : DEFAULT_INTERNAL_INTERESTS)[0]

/** Counts for the logged-in reviewer's own questionnaires; pass the cases sent to the team */
export const internalInterestKpis = (requests: PartnershipRequest[]): RoleKpi[] => {
  const submitted = requests.filter((r) => internalReviewer(r)?.status === 'Completed')
  const verdicts = (verdict: string) =>
    submitted.filter((r) => internalReviewer(r).decision === verdict).length
  return [
    {
      title: 'Pending Responses',
      caption: 'Assigned questionnaires awaiting submission.',
      value: requests.length - submitted.length,
    },
    {
      title: 'Submitted',
      caption: 'Questionnaires submitted by you.',
      value: submitted.length,
    },
    {
      title: 'Proceed Recommendations',
      caption: 'Your submitted proceed verdicts.',
      value: verdicts('Proceed'),
    },
    {
      title: 'Reject Recommendations',
      caption: 'Your submitted reject verdicts.',
      value: verdicts('Reject'),
    },
  ]
}

/** Counts for the Strategy Lead's own assessments; pass the cases sent to the Strategy team */
export const strategyLeadKpis = (requests: PartnershipRequest[]): RoleKpi[] => {
  const submitted = requests.filter((r) => Boolean(r.stageApprovals?.strategy))
  const verdicts = (status: 'approved' | 'declined') =>
    submitted.filter((r) => r.stageApprovals?.strategy?.status === status).length
  return [
    {
      title: 'Pending Reviews',
      caption: 'Strategic assessments awaiting your verdict.',
      value: requests.length - submitted.length,
    },
    {
      title: 'Verdicts Submitted',
      caption: 'Strategic assessments completed by you.',
      value: submitted.length,
    },
    {
      title: 'Proceed Recommendations',
      caption: 'Your submitted proceed verdicts.',
      value: verdicts('approved'),
    },
    {
      title: 'Reject Recommendations',
      caption: 'Your submitted reject verdicts.',
      value: verdicts('declined'),
    },
  ]
}

/**
 * Counts for the sponsor's own cases. Due diligence is complete once the TDD report is uploaded.
 * The data has no due diligence deadlines yet, so Overdue can only count tasks that carry one:
 * until such a field exists it stays at 0.
 */
export const sponsorKpis = (requests: PartnershipRequest[]): RoleKpi[] => {
  const completed = requests.filter((r) => Boolean(r.value?.tddGeneratedOn))
  const pending = requests.filter((r) => !r.value?.tddGeneratedOn && !isTerminal(r))
  return [
    {
      title: 'Assigned Requests',
      caption: 'Requests assigned to your ownership.',
      value: requests.length,
    },
    {
      title: 'Due Diligence Pending',
      caption: 'Assigned requests not yet completed.',
      value: pending.length,
    },
    {
      title: 'Completed',
      caption: 'Due diligence completed by you.',
      value: completed.length,
    },
    {
      title: 'Overdue',
      caption: 'Assigned tasks past their deadline.',
      value: 0,
    },
  ]
}

/**
 * Partnership Admin: pass every case. Decisions only carry a timestamp (`decidedAt`) when they were
 * taken in the app, so earlier seeded decisions cannot be placed in a month.
 */
export const adminKpis = (requests: PartnershipRequest[], now = new Date()): RoleKpi[] => {
  const decidedThisMonth = requests.filter((r) => {
    const at = r.adminDecision?.decidedAt ? new Date(r.adminDecision.decidedAt) : null
    return at !== null && at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth()
  })
  return [
    {
      title: 'Awaiting Review',
      caption: 'New requests to assess.',
      value: requests.filter((r) => r.queue === 'admin' && !r.adminDecision).length,
    },
    {
      title: 'Reviewed This Month',
      caption: 'Decisions recorded this month.',
      value: decidedThisMonth.length,
    },
    {
      title: 'Proceeded',
      caption: 'Forwarded to Director.',
      value: requests.filter((r) => r.queue === 'director').length,
    },
    {
      title: 'Rejected',
      caption: 'Closed at admin review.',
      value: requests.filter((r) => r.adminDecision?.action === 'reject').length,
    },
  ]
}

/** Director: pass the cases in the Director's queue */
export const directorKpis = (requests: PartnershipRequest[]): RoleKpi[] => {
  const open = requests.filter((r) => !isTerminal(r))
  const stage = (r: PartnershipRequest) => getStageLabel(r)
  const awaitingTeams = (r: PartnershipRequest) =>
    (stage(r) === 'Internal Canvas' && Boolean(r.sent?.internal)) ||
    (stage(r) === 'Strategic Alignment' && Boolean(r.sent?.strategy) && !r.stageApprovals?.strategy)
  return [
    {
      title: 'Awaiting My Decision',
      caption: 'Initial reviews and escalations.',
      value: requests.filter(needsDirectorDecision).length,
    },
    {
      title: 'Internal Canvas',
      caption: 'Awaiting team responses.',
      value: open.filter(awaitingTeams).length,
    },
    {
      title: 'NDA & Discovery',
      caption: 'In the current stage.',
      value: open.filter((r) => stage(r) === 'NDA & Discovery').length,
    },
    {
      title: 'Alignment Pack',
      caption: 'Awaiting preparation or review.',
      value: open.filter(
        (r) =>
          stage(r) === 'NDA & Discovery' && Boolean(r.alignmentPackOn) && !r.discovery?.proceededOn
      ).length,
    },
  ]
}
