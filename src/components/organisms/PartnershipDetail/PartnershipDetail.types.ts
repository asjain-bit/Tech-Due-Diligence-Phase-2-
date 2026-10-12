import type { PartnershipRequest } from '@/types/partnership.types'

export type DetailTab = 'overview' | 'brief' | 'audit_log'

export interface PartnershipDetailProps {
  request: PartnershipRequest
  onBack: () => void
  onProceed: (requestId: string, reason: string) => void
  onReject: (requestId: string, reason: string) => void
  className?: string
}
