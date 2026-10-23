import type { ConfidenceLevel } from '@/components/organisms/AgentActions'
import type { CaseType } from '@/types/partnership.types'
import type { AdminRouting } from '@/lib/caseActions'

export interface AdminActionModalProps {
  /** `reassign` only changes the request type of a case that was already decided */
  mode: 'proceed' | 'reject' | 'reassign'
  /** Agent confidence for each request type, shown in the dropdown */
  typeConfidence: Record<CaseType, ConfidenceLevel>
  initialType?: CaseType
  initialReason?: string
  onConfirm: (routing: AdminRouting) => void
  onClose: () => void
}
