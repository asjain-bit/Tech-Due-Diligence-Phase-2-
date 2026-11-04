export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}
