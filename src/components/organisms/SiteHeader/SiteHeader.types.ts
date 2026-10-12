export interface NavLinkItem {
  label: string
  href: string
  active?: boolean
}

export interface HeaderUser {
  name: string
  avatarUrl?: string
  role?: string
}

export interface SiteHeaderProps {
  title?: string
  links?: NavLinkItem[]
  user?: HeaderUser
  searchValue?: string
  onSearchChange?: (val: string) => void
  onSearchSubmit?: (val: string) => void
  className?: string
}
