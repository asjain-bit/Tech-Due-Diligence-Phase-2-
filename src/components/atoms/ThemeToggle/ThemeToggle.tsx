'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeToggleProps } from './ThemeToggle.types'

/**
 * ThemeToggle — Atom
 * Interactive toggle button cycling through light, dark, and system themes.
 * Used in: SiteHeader, SettingsPanel
 */
export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ size = 'md', className = '', ...rest }, ref) => {
    const { theme, setTheme } = useTheme()

    const handleCycleTheme = () => {
      if (theme === 'light') {
        setTheme('dark')
      } else if (theme === 'dark') {
        setTheme('system')
      } else {
        setTheme('light')
      }
    }

    const sizeClasses = {
      sm: 'h-8 w-8 text-xs p-1.5',
      md: 'h-10 w-10 text-sm p-2',
      lg: 'h-12 w-12 text-base p-2.5',
    }[size]

    const baseClasses =
      'inline-flex items-center justify-center rounded-md border border-border-default bg-bg-surface-1 text-text-primary hover:bg-bg-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus cursor-pointer'

    const combinedClasses = `${baseClasses} ${sizeClasses} ${className}`.trim()

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleCycleTheme}
        aria-label={`Toggle theme: current mode is ${theme}`}
        title={`Current mode: ${theme}`}
        className={combinedClasses}
        {...rest}
      >
        {theme === 'light' && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
        {theme === 'dark' && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
        {theme === 'system' && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            aria-hidden="true"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )}
      </button>
    )
  }
)

ThemeToggle.displayName = 'ThemeToggle'
