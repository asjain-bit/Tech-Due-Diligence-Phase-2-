import React from 'react'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  helperText?: string
  required?: boolean
  className?: string
  children?: React.ReactNode
}
