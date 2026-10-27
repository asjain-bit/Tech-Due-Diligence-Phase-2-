import React from 'react'
import type { RadioProps } from './Radio.types'

/**
 * Radio — Atom
 * Native radio with the app's filled style: a primary circle with a white dot when selected.
 * Used in: BriefDecisionModal, SponsorAssignModal
 */
export const Radio: React.FC<RadioProps> = ({
  checked,
  onChange,
  name,
  label,
  disabled = false,
  className = '',
}) => (
  <label
    className={`flex items-center gap-3 text-sm font-medium text-[#0d212c] ${
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
    } ${className}`.trim()}
  >
    <input
      type="radio"
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#36c0c9]/40 ${
        checked ? 'bg-[#36c0c9] border-[#36c0c9]' : 'bg-white border-slate-300'
      }`}
    >
      {checked && <span className="w-2 h-2 rounded-full bg-white" />}
    </span>
    {label}
  </label>
)
