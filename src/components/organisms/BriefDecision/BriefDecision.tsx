'use client'

/**
 * BriefDecision — Organism
 * The Director's decision on the initial assessment brief: approve for internal review,
 * reject, or request more information, always with a written reason. Locks once recorded.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { BriefDecisionChoice, BriefDecisionProps } from './BriefDecision.types'

const MAX = 500

const OPTIONS: {
  value: BriefDecisionChoice
  title: string
  hint: string
  placeholder: string
}[] = [
  {
    value: 'approve',
    title: 'Approve for internal review',
    hint: 'Send to the Strategy Team and Internal Interest reviewers.',
    placeholder: 'Explain the key reasons for your decision...',
  },
  {
    value: 'reject',
    title: 'Reject request',
    hint: 'Close the request with a recorded reason.',
    placeholder: 'Explain the key reasons for your decision...',
  },
  {
    value: 'request_info',
    title: 'Request more info',
    hint: 'Email the vendor and put the case on hold.',
    placeholder: 'What information do you need from the vendor?',
  },
]

export const BriefDecision: React.FC<BriefDecisionProps> = ({
  agentRecommendation,
  onSubmit,
  submitted,
  className = '',
}) => {
  const [choice, setChoice] = useState<BriefDecisionChoice | null>(null)
  const [reason, setReason] = useState('')

  const locked = Boolean(submitted)
  const selected = submitted?.decision ?? choice
  const text = submitted ? (submitted.reason ?? '') : reason
  const canSubmit = Boolean(choice) && reason.trim().length > 0
  const placeholder =
    OPTIONS.find((o) => o.value === selected)?.placeholder ?? OPTIONS[0].placeholder

  return (
    <div className={`flex flex-col gap-5 ${className}`.trim()}>
      <div
        role="radiogroup"
        aria-label="Your decision"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value
          const hinted =
            !locked &&
            agentRecommendation ===
              (opt.value === 'approve' ? 'proceed' : opt.value === 'reject' ? 'reject' : undefined)
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={locked}
              onClick={() => setChoice(opt.value)}
              className={`p-4 rounded-xl border border-[#d6dee6] bg-white flex items-start gap-3 text-left transition ${
                locked ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'border-[#36c0c9] bg-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-[#36c0c9]" />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-[#0d212c] flex items-center gap-2 flex-wrap">
                  {opt.title}
                  {hinted && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e0f2fe] text-[#0369a1]">
                      Agent recommends
                    </span>
                  )}
                </span>
                <span className="text-xs text-[#64748b] leading-snug">{opt.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="decision-reason" className="text-xs font-semibold text-[#475569]">
          Reason{!locked && <span className="text-red-500 font-semibold"> *</span>}
        </label>
        <textarea
          id="decision-reason"
          rows={3}
          maxLength={MAX}
          value={text}
          disabled={locked}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] leading-relaxed resize-none shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15 disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:shadow-none"
        />
        {!locked && (
          <span className="text-[11px] text-[#94a3b8] self-end">
            {reason.length} / {MAX}
          </span>
        )}
      </div>

      {!locked && (
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => choice && onSubmit(choice, reason.trim())}
            className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-2"
          >
            Submit decision
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
