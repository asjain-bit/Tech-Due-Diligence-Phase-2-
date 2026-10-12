export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}
