export type StatusCategory = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'finalised'

export interface StatusChipProps {
  /** Text label to display inside chip */
  label: string
  /** Semantic status style */
  status?: StatusCategory
  /** Optional additional CSS class names */
  className?: string
  /** Whether to show a colored indicator dot */
  dot?: boolean
}
