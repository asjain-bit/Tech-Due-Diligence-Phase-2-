import type { PartnershipRequest } from '@/types/partnership.types'

export interface PreReadSummaryProps {
  request: PartnershipRequest
  /** Names of the knowledge base files added before generating */
  documents?: string[]
  className?: string
}
