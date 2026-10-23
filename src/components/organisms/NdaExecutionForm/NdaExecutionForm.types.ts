import type { PartnershipRequest } from '@/types/partnership.types'

export interface NdaExecutionFormProps {
  request: PartnershipRequest
  /** Set for the signed copy: the signature and date lines show as signed */
  signedOn?: string
  className?: string
}
