import type { AuditEvent, AuditKind } from '@/types/partnership.types'

export interface AuditLogProps {
  /** Events in the order they happened, oldest first. The newest is shown on top. */
  events: AuditEvent[]
  className?: string
}

export interface AuditKindStyle {
  label: string
  /** Legend dot and the icon colour */
  dot: string
  /** Icon circle fill and stroke */
  badge: string
}

export type AuditKindStyles = Record<AuditKind, AuditKindStyle>
