import type { PartnershipRequest } from '@/types/partnership.types'

export interface VendorFormResponseProps {
  request: PartnershipRequest
  onClose: () => void
  /** Hide the vendor's personal contact details (Internal and Strategy reviewers) */
  hideContact?: boolean
}
