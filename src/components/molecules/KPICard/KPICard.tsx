import React from 'react'
import { Badge } from '@/components/atoms/Badge'
import { Icon } from '@/components/atoms/Icon'
import type { KPICardProps } from './KPICard.types'

/**
 * KPICard — Molecule
 * Metric summary card displaying key performance indicators, delta, and status badge.
 * Used in: SiteHeader, page
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  badgeText,
  description,
  className = '',
}) => {
  const badgeVariant = trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'

  return (
    <div
      className={`p-5 rounded-xl border border-border-default bg-bg-surface-1 shadow-xs flex flex-col gap-3 transition-colors hover:border-border-strong ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          {title}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-text-primary tracking-tight">{value}</span>

        {change && (
          <div
            className={`flex items-center text-xs font-medium gap-1 ${
              trend === 'up'
                ? 'text-status-success-text'
                : trend === 'down'
                  ? 'text-status-error-text'
                  : 'text-text-secondary'
            }`}
          >
            {trend === 'up' && <Icon name="check" size="sm" />}
            {trend === 'down' && <Icon name="alert" size="sm" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && <p className="text-xs text-text-tertiary mt-auto">{description}</p>}
    </div>
  )
}
