import type { CaseAction } from '@/lib/caseActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface ValueDueDiligenceStageProps {
  request: PartnershipRequest
  /** The sponsor acts in this stage; the Director follows along */
  role: 'director' | 'sponsor' | 'viewer'
  onAction: (action: CaseAction) => void
  className?: string
}
