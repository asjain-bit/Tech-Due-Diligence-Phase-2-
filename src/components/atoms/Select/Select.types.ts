import React from 'react'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  selectSize?: SelectSize
  hasError?: boolean
  options?: SelectOption[]
  children?: React.ReactNode
}
