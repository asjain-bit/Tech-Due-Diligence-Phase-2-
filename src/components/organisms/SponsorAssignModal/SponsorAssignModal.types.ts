import type { InternalInterestStakeholder } from '@/types/partnership.types'

export interface SponsorAssignModalProps {
  /** The reviewers who said they are ready to sponsor */
  candidates: InternalInterestStakeholder[]
  onConfirm: (assignment: { lead: string; co: string[] }) => void
  onClose: () => void
}
