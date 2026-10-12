import React from 'react'
import type { TextareaProps } from './Textarea.types'

/**
 * Textarea — Atom
 * Multi-line text field control.
 * Used in: FormField, SettingsPanel
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { hasError = false, resize = 'vertical', className = '', disabled = false, rows = 3, ...rest },
    ref
  ) => {
    const baseClasses =
      'w-full rounded-md border bg-bg-input text-text-primary px-3 py-2 text-sm placeholder:text-text-placeholder transition-colors focus:outline-none focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-disabled'

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize]

    const errorClass = hasError
      ? 'border-status-error-border text-status-error-text focus:border-status-error-border'
      : 'border-border-default'

    const combinedClasses = `${baseClasses} ${resizeClasses} ${errorClass} ${className}`.trim()

    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={hasError ? true : undefined}
        className={combinedClasses}
        {...rest}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
