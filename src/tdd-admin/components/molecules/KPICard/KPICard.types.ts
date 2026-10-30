export interface KPICardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  badgeText?: string
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  className?: string
}
