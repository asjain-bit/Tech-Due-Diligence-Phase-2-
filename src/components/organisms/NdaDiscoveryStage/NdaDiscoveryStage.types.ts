import type { CaseAction } from '@/lib/caseActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface NdaDiscoveryStageProps {
  request: PartnershipRequest
  /** Only the Director sees the NDA template and uploads the signed copy */
  role: 'director' | 'sponsor' | 'viewer'
  onAction: (action: CaseAction) => void
  /** Moves on to Value & Due Diligence from the alignment pack */
  onNext: () => void
  className?: string
}
