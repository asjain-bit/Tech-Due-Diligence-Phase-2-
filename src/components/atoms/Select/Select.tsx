import React from 'react'
import type { SelectProps } from './Select.types'

/**
 * Select — Atom
 * Dropdown select menu control.
 * Used in: DataTable, SettingsPanel
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      selectSize = 'md',
      hasError = false,
      options,
      className = '',
      disabled = false,
      children,
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      'w-full rounded-md border bg-bg-input text-text-primary transition-colors focus:outline-none focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-disabled cursor-pointer'

    const sizeClasses = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    }[selectSize]

    const errorClass = hasError
      ? 'border-status-error-border text-status-error-text focus:border-status-error-border'
      : 'border-border-default'

    const combinedClasses = `${baseClasses} ${sizeClasses} ${errorClass} ${className}`.trim()

    return (
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        className={combinedClasses}
        {...rest}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    )
  }
)

Select.displayName = 'Select'
