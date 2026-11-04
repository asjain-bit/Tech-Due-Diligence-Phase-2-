import React from 'react'
import { Check } from 'lucide-react'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', disabled, id, checked, onChange, ...props }, ref) => {
    const generatedId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`

    return (
      <label
        htmlFor={generatedId}
        className={[
          'inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-[#0d212c]',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={generatedId}
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 rounded-md border border-[#cbd5e1] bg-white transition-all flex items-center justify-center peer-checked:border-[#36c0c9] peer-checked:bg-[#36c0c9]">
            {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
        </div>
        {label && <span>{label}</span>}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'
