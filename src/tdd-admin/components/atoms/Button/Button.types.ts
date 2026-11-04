import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}
