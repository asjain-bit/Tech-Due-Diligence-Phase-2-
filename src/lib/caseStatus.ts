import { getStageLabel } from '@/lib/caseActions'
import { DEFAULT_INTERNAL_INTERESTS, type PartnershipRequest } from '@/types/partnership.types'

/** The five statuses every profile sees on a case */
export type DisplayStatus = 'Completed' | 'Pending' | 'In Progress' | 'Closed' | 'RFI'

export type StatusRole = 'admin' | 'director' | 'internal' | 'strategy' | 'sponsor'

export const DISPLAY_STATUSES: DisplayStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
  'Closed',
  'RFI',
]

const isTerminal = (r: PartnershipRequest) => r.status === 'Closed' || r.status === 'Exited'

/** Does the Director have to decide something on this case right now? */
export const needsDirectorDecision = (r: PartnershipRequest) => {
  if (isTerminal(r) || r.queue !== 'director') return false
  const briefPending = getStageLabel(r) === 'Initial Assessment Brief'
  // The vendor owes information: nothing for the Director to do yet
  if (briefPending) return r.status === 'Pending' && !r.decision
  const scenario = r.internalOutcome?.scenario
  const sponsorsToAssign = scenario === 'multiple' && !r.sponsors
  const conflict =
    r.stageApprovals?.internal?.status === 'approved' &&
    r.stageApprovals?.strategy?.status === 'declined'
  return scenario === 'not-ready' || sponsorsToAssign || conflict
}

/** Is the case waiting on this role right now? */
const waitingOn = (r: PartnershipRequest, role: StatusRole): boolean => {
  const stage = getStageLabel(r)
  switch (role) {
    case 'admin':
      return r.queue === 'admin' && !r.adminDecision
    case 'director':
      if (needsDirectorDecision(r)) return true
      // The Director sends each team request, and runs the NDA and discovery work
      if (stage === 'Internal Canvas') return !r.sent?.internal
      if (stage === 'Strategic Alignment') return !r.sent?.strategy && !r.stageApprovals?.strategy
      return stage === 'NDA & Discovery'
    case 'internal': {
      const reviewer = (
        r.internalInterests?.length ? r.internalInterests : DEFAULT_INTERNAL_INTERESTS
      )[0]
      return stage === 'Internal Canvas' && reviewer?.status !== 'Completed'
    }
    case 'strategy':
      return stage === 'Strategic Alignment' && !r.stageApprovals?.strategy
    case 'sponsor':
      return stage === 'Value & Due Diligence'
  }
}

/**
 * The status of a case as the given role sees it: Pending when the case waits on that role,
 * In Progress when it waits on someone else.
 */
export const getDisplayStatus = (r: PartnershipRequest, role: StatusRole): DisplayStatus => {
  if (isTerminal(r) || r.queue === 'closed') return 'Closed'
  if (r.status === 'Information Requested') return 'RFI'
  if (r.value?.tddGeneratedOn) return 'Completed'
  return waitingOn(r, role) ? 'Pending' : 'In Progress'
}
