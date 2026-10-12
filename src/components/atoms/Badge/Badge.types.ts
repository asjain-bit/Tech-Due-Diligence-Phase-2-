import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
}
