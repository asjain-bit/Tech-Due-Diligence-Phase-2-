import type { AgentAction } from '@/components/organisms/AgentActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface AnalysisDrawerProps {
  request: PartnershipRequest
  actions: AgentAction[]
  onClose: () => void
}
