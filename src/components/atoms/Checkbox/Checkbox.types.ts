export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Text shown next to the box, also its accessible name */
  label: string
  disabled?: boolean
  className?: string
}
