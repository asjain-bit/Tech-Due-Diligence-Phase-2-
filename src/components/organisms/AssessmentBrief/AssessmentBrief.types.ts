import type { ReactNode } from 'react'
import type { AgentAction } from '@/components/organisms/AgentActions'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface AssessmentBriefProps {
  request: PartnershipRequest
  /** The agent checks behind the brief, summarised in the AI analysis banner */
  actions: AgentAction[]
  onViewVendorResponse: () => void
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
