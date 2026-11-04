import React from 'react'

export type ThemeToggleSize = 'sm' | 'md' | 'lg'

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ThemeToggleSize
}
