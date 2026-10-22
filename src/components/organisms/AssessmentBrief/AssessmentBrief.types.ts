import type { ReactNode } from 'react'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface AssessmentBriefProps {
  request: PartnershipRequest
  onViewVendorResponse: () => void
  /** Step actions such as the decision form or a Continue button */
  children?: ReactNode
  className?: string
}
