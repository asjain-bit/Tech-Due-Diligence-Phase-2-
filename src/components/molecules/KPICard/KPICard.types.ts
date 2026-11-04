export type KPITrend = 'up' | 'down' | 'neutral'

export interface KPICardProps {
  title: string
  value: string | number
  change?: string
  trend?: KPITrend
  badgeText?: string
  description?: string
  className?: string
}
