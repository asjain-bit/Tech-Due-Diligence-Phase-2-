import type { CaseAction } from '@/lib/caseActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface DiscoveryCallStageProps {
  request: PartnershipRequest
  /** Only the Director adds the call material and hands the case to the sponsor */
  role: 'director' | 'sponsor' | 'viewer'
  onAction: (action: CaseAction) => void
  /** Moves on to Value & Due Diligence */
  onNext: () => void
  className?: string
}
