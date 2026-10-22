import type { PartnershipRequest } from '@/types/partnership.types'
import type { AdminRouting } from '@/lib/caseActions'
import type { UserProfile } from '@/components/screens/LoginScreen'

export type DetailTab = 'overview' | 'review'

export interface PartnershipDetailProps {
  request: PartnershipRequest
  onBack: () => void
  onProceed: (requestId: string, reason: string) => void
  onReject: (requestId: string, reason: string) => void
  userProfile?: UserProfile
  /** Every case, used by the Partnership Admin checks to spot repeat applicants */
  allRequests?: PartnershipRequest[]
  /** Director asks the vendor for more information; the case goes on hold */
  onRequestInfo?: (requestId: string, email: { to: string; subject: string; body: string }) => void
  /** Vendor information has arrived */
  onResume?: (requestId: string) => void
  /** Partnership Admin routes the case */
  onRoute?: (requestId: string, routing: AdminRouting) => void
  /** Play the agent run animation on first open. Turn off to start at the brief. */
  animateAgentRun?: boolean
  className?: string
}
