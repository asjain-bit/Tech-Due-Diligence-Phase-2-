import type { ConfidenceLevel } from '@/components/organisms/AgentActions'
import type { CaseType, PartnershipRequest } from '@/types/partnership.types'
import type { AdminRouting } from '@/lib/caseActions'

export interface AdminDecisionProps {
  /** Agent confidence for each case type */
  typeConfidence: Record<CaseType, ConfidenceLevel>
  /** Routing already recorded for this case */
  submitted?: PartnershipRequest['adminDecision']
  /** The Director has not decided yet, so the submission can still be edited */
  canEdit: boolean
  onSubmit: (routing: AdminRouting) => void
  className?: string
}
