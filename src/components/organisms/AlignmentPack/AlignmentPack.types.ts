import type { ReactNode } from 'react'
import type { PartnershipRequest } from '@/types/partnership.types'

export interface AlignmentPackProps {
  request: PartnershipRequest
  /** Extra section added at the end and in the side panel, e.g. the discovery call */
  extraSection?: { id: string; label: string; content: ReactNode }
  className?: string
}
