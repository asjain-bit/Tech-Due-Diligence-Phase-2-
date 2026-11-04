/**
 * Spinner — Atom
 * Loading activity indicator.
 * Used in: Button, DataTable, KPICard
 */

import React from 'react'
import { SpinnerProps } from './Spinner.types'

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', ...props }) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  }

  const combinedClassName = [
    'inline-block animate-spin rounded-full border-solid border-action-primary-bg-default border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div role="status" aria-label="loading" className={combinedClassName} {...props} />
}
