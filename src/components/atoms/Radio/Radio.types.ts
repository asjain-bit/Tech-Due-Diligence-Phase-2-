import type { ReactNode } from 'react'

export interface RadioProps {
  checked: boolean
  onChange: () => void
  /** Groups the radios: only one in a group can be selected */
  name: string
  /** Text or content next to the dot, also its accessible name */
  label: ReactNode
  disabled?: boolean
  /** Styles the whole row, e.g. to make it a bordered card */
  className?: string
}
