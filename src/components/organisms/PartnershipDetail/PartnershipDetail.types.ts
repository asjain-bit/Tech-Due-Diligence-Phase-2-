import type { PartnershipRequest } from '@/types/partnership.types'
import type { UserProfile } from '@/components/screens/LoginScreen'

export type DetailTab =
  'overview' | 'brief' | 'internal_interest' | 'internal_review' | 'questionnaire'

export interface PartnershipDetailProps {
  request: PartnershipRequest
  onBack: () => void
  onProceed: (requestId: string, reason: string) => void
  onReject: (requestId: string, reason: string) => void
  userProfile?: UserProfile
  className?: string
}
