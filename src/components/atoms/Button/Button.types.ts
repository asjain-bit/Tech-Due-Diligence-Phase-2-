import React from 'react'

export type ButtonVariant = 'primary' | 'destructive' | 'outline' | 'ghost' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children?: React.ReactNode
}
