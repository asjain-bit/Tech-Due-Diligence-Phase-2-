import type { ReactNode } from 'react'

export interface StageFooterProps {
  children: ReactNode
  /** Tighter space above, for stages that fill the page height */
  compact?: boolean
  className?: string
}
