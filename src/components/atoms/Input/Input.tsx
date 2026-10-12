import React from 'react'
import type { InputProps } from './Input.types'

/**
 * Input — Atom
 * Standard text input control for collecting user text entry.
 * Used in: FormField, SearchBar, SettingsPanel, DataTable
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = 'md',
      hasError = false,
      className = '',
      disabled = false,
      type = 'text',
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      'w-full rounded-md border bg-bg-input text-text-primary placeholder:text-text-placeholder transition-colors focus:outline-none focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-disabled'

    const sizeClasses = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    }[inputSize]

    const errorClass = hasError
      ? 'border-status-error-border text-status-error-text focus:border-status-error-border'
      : 'border-border-default'

    const combinedClasses = `${baseClasses} ${sizeClasses} ${errorClass} ${className}`.trim()

    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        className={combinedClasses}
        {...rest}
      />
    )
  }
)

Input.displayName = 'Input'
