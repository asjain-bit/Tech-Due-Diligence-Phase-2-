import type { ReactNode } from 'react'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface AssessmentBriefProps {
  request: PartnershipRequest
  onOpenAnalysis: () => void
  /** Hide the vendor's personal contact details (Internal and Strategy reviewers) */
  hideContact?: boolean
  /** Show the agent verdict (Partnership Admin and Director only) */
  showVerdict?: boolean
  /** Decision form. When given it becomes the last section of the brief. */
  decision?: ReactNode
  /** Step actions shown under the brief, such as a Continue button */
  footer?: ReactNode
  className?: string
}
