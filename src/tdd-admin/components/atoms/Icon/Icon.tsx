/**
 * Icon — Atom
 * SVG icon renderer for standard icon set.
 * Used in: SearchBar, ThemeToggle, Toast, SiteHeader, KPICard, LoginScreen
 */

import React from 'react'
import { IconProps } from './Icon.types'

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '', ...props }) => {
  const renderPath = () => {
    switch (name) {
      case 'sun':
        return (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        )
      case 'moon':
        return <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      case 'laptop':
        return (
          <>
            <rect width="18" height="12" x="3" y="4" rx="2" />
            <line x1="2" x2="22" y1="20" y2="20" />
          </>
        )
      case 'search':
        return (
          <>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </>
        )
      case 'chevron-down':
        return <path d="m6 9 6 6 6-6" />
      case 'check':
        return <path d="M20 6 9 17l-5-5" />
      case 'x':
        return <path d="M18 6 6 18M6 6l12 12" />
      case 'user':
        return (
          <>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>
        )
      case 'bell':
        return (
          <>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </>
        )
      case 'menu':
        return (
          <>
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </>
        )
      case 'lock':
        return (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        )
      case 'info':
        return (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </>
        )
      case 'plus':
        return (
          <>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </>
        )
      case 'fingerprint':
        return (
          <>
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M14 13.12c0 2.38-.2 4.43-.46 6.38" />
            <path d="M18 11a6 6 0 0 0-12 0c0 2.21.36 4.3.74 6" />
            <path d="M6 10a6 6 0 0 1 12 0" />
            <path d="M20 11.5a8 8 0 0 0-16 0c0 2.7.46 5.2 1 7.5" />
            <path d="M8.5 7.5a4.5 4.5 0 0 1 9 0" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['inline-block shrink-0', className].filter(Boolean).join(' ')}
      {...props}
    >
      {renderPath()}
    </svg>
  )
}
