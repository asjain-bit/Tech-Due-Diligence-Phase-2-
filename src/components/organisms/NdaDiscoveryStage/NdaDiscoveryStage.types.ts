import type { CaseAction } from '@/lib/caseActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface NdaDiscoveryStageProps {
  request: PartnershipRequest
  /** The Director handles the NDA; the sponsor handles the discovery call */
  role: 'director' | 'sponsor'
  onAction: (action: CaseAction) => void
  className?: string
}
