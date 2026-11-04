import React from 'react'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: boolean
}
