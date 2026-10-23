'use client'

/**
 * SponsorAssignModal — Organism
 * Shown when more than one reviewer is ready to sponsor: the Director picks the lead sponsor
 * and which of the others join as co-sponsors.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useId, useState } from 'react'
import { Circle, CircleDot, X } from 'lucide-react'
import { Checkbox } from '@/components/atoms/Checkbox'
import type { SponsorAssignModalProps } from './SponsorAssignModal.types'

export const SponsorAssignModal: React.FC<SponsorAssignModalProps> = ({
  candidates,
  onConfirm,
  onClose,
}) => {
  const [lead, setLead] = useState('')
  const [co, setCo] = useState<string[]>([])
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const chooseLead = (name: string) => {
    setLead(name)
    setCo((prev) => prev.filter((n) => n !== name))
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between gap-3 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-[#e2e8f0] shrink-0">
          <div>
            <h3 id={titleId} className="text-xl font-semibold text-[#0d212c]">
              Assign sponsors
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              {candidates.length} people are ready to sponsor. Choose the lead and any co-sponsors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assign sponsors"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-5 flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-[#475569] mb-1">
              Lead sponsor <span className="text-red-500">*</span>
            </legend>
            {candidates.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#d6dee6] hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="radio"
                  name="lead-sponsor"
                  checked={lead === c.name}
                  onChange={() => chooseLead(c.name)}
                  className="peer sr-only"
                />
                {lead === c.name ? (
                  <CircleDot className="w-5 h-5 text-[#36c0c9] shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" aria-hidden="true" />
                )}
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[#0d212c]">{c.name}</span>
                  <span className="text-xs text-[#64748b] truncate">{c.role}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-[#475569] mb-1">Co-sponsors</legend>
            {candidates
              .filter((c) => c.name !== lead)
              .map((c) => (
                <Checkbox
                  key={c.id}
                  label={c.name}
                  checked={co.includes(c.name)}
                  onChange={(checked) =>
                    setCo((prev) =>
                      checked ? [...prev, c.name] : prev.filter((n) => n !== c.name)
                    )
                  }
                />
              ))}
            {lead === '' && (
              <p className="text-xs text-[#64748b]">Choose the lead sponsor first.</p>
            )}
          </fieldset>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-[#e2e8f0] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={lead === ''}
            onClick={() => onConfirm({ lead, co })}
            className="h-11 px-6 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition cursor-pointer"
          >
            Assign sponsors
          </button>
        </div>
      </div>
    </div>
  )
}
