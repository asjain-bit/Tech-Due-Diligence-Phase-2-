/**
 * Avatar — Atom
 * User profile picture or initials fallback representation.
 * Used in: SiteHeader, SettingsPanel, DataTable
 */

import React, { useState } from 'react'
import { AvatarProps } from './Avatar.types'

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  fallback = 'U',
  size = 'md',
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false)

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const baseStyle =
    'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-bg-surface-3 text-text-primary font-semibold border border-border-default select-none'

  const combinedClassName = [baseStyle, sizeStyles[size], className].filter(Boolean).join(' ')

  if (src && !error) {
    return (
      <div className={combinedClassName} {...props}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={combinedClassName} {...props}>
      <span>{fallback.substring(0, 2).toUpperCase()}</span>
    </div>
  )
}
