import React from 'react'
import { Check } from 'lucide-react'
import type { CheckboxProps } from './Checkbox.types'

/**
 * Checkbox — Atom
 * Native checkbox with the app's filled style: primary fill and a white tick when checked.
 * Used in: AddQuestionModal
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => (
  <label
    className={`inline-flex items-center gap-2.5 text-sm font-medium text-[#0d212c] ${
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    } ${className}`.trim()}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#36c0c9]/40 ${
        checked ? 'bg-[#36c0c9] border-[#36c0c9] text-white' : 'bg-white border-slate-300'
      }`}
    >
      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
    </span>
    {label}
  </label>
)
