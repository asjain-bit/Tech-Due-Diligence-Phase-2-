import type { PartnershipRequest } from '@/types/partnership.types'

export interface RequestInfoEmail {
  to: string
  subject: string
  body: string
}

export interface RequestInfoModalProps {
  request: PartnershipRequest
  /** What the Director wrote as the reason, dropped into the email */
  reason: string
  /** Who is sending the email */
  senderName: string
  onSend: (email: RequestInfoEmail) => void
  onClose: () => void
}
