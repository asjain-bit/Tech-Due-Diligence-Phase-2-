'use client'

/**
 * PrototypeScenarioSelect — Molecule
 * Prototype-only dropdown that simulates how the Internal Interest team responded, so every
 * outcome can be walked through. A tooltip says it is not part of the real application.
 * Used in: PartnershipDetail
 */

import React from 'react'
import { ChevronDown, FlaskConical } from 'lucide-react'
import type { InternalScenario } from '@/types/partnership.types'
import type { PrototypeScenarioSelectProps } from './PrototypeScenarioSelect.types'

export const INTERNAL_SCENARIOS: { value: InternalScenario; label: string }[] = [
  { value: 'none', label: 'No one responds' },
  { value: 'not-ready', label: 'Someone responds, no one is ready to sponsor' },
  { value: 'single', label: 'One person is ready to sponsor' },
  { value: 'multiple', label: '2-3 people are ready to sponsor' },
]

export const PrototypeScenarioSelect: React.FC<PrototypeScenarioSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => (
  <div className={`flex flex-col gap-1.5 w-full sm:max-w-md ${className}`.trim()}>
    <div className="relative group inline-flex items-center gap-1.5 self-start">
      <label htmlFor="prototype-scenario" className="text-xs font-semibold text-[#475569]">
        Simulate the team&apos;s response
      </label>
      <button
        type="button"
        aria-label="About this field"
        className="text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center"
      >
        <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <div
        role="tooltip"
        className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-0 bottom-full mb-1.5 z-40 w-72 bg-[#0d212c] text-white text-[11px] font-medium px-3 py-2 rounded-lg shadow-xl"
      >
        This is only for prototype functioning and will not be included in the actual developed
        application.
      </div>
    </div>
    <div className="relative">
      <select
        id="prototype-scenario"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as InternalScenario)}
        className={`w-full h-10 appearance-none pl-3 pr-10 rounded-lg border border-[#d6dee6] bg-white text-sm shadow-2xs transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2] disabled:bg-[#f8fafc] disabled:cursor-not-allowed cursor-pointer ${
          value ? 'text-[#0d212c]' : 'text-[#9aa8b5]'
        }`}
      >
        <option value="" disabled>
          Choose a case to walk through
        </option>
        {INTERNAL_SCENARIOS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  </div>
)
