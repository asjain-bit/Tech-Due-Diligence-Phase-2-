import type { PartnershipRequest } from '@/types/partnership.types'
import type { UserProfile } from '@/components/screens/LoginScreen'

export type DetailTab = 'overview' | 'review'

export interface PartnershipDetailProps {
  request: PartnershipRequest
  onBack: () => void
  onProceed: (requestId: string, reason: string) => void
  onReject: (requestId: string, reason: string) => void
  userProfile?: UserProfile
  /** Play the agent run animation on first open. Turn off to start at the brief. */
  animateAgentRun?: boolean
  className?: string
}
