import React from 'react'
import { Input } from '@/components/atoms/Input'
import type { FormFieldProps } from './FormField.types'

/**
 * FormField — Molecule
 * Labeled input form control with optional helper message and validation error display.
 * Used in: SettingsPanel
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  helperText,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`.trim()}>
      <label htmlFor={id} className="text-sm font-medium text-text-primary flex items-center gap-1">
        {label}
        {required && <span className="text-status-error-text">*</span>}
      </label>

      {children ? children : <Input id={id} hasError={Boolean(error)} />}

      {error ? (
        <p id={`${id}-error`} className="text-xs text-status-error-text mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-text-tertiary mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
