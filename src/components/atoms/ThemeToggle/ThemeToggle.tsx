'use client'

import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeToggleProps } from './ThemeToggle.types'

const sizePixelMap = {
  sm: 16,
  md: 20,
  lg: 24,
}

/**
 * ThemeToggle — Atom
 * Interactive toggle button cycling through light, dark, and system themes using Lucide icons.
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
    const iconSize = sizePixelMap[size]

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
        {theme === 'light' && <Sun size={iconSize} strokeWidth={2} aria-hidden="true" />}
        {theme === 'dark' && <Moon size={iconSize} strokeWidth={2} aria-hidden="true" />}
        {theme === 'system' && <Monitor size={iconSize} strokeWidth={2} aria-hidden="true" />}
      </button>
    )
  }
)

ThemeToggle.displayName = 'ThemeToggle'
