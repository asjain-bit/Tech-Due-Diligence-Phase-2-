'use client'

/**
 * BriefDecision — Organism
 * The Director's decision on the initial assessment brief: approve for internal review or
 * reject, always with a written rationale. Locks once the decision is recorded.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, User } from 'lucide-react'
import type { BriefDecisionChoice, BriefDecisionProps } from './BriefDecision.types'

const MAX = 500

const OPTIONS: {
  value: BriefDecisionChoice
  title: string
  hint: string
  selected: string
}[] = [
  {
    value: 'approve',
    title: 'Approve for internal review',
    hint: 'Send to Internal Interest and Strategy reviewers.',
    selected: 'border-[#36c0c9] bg-[#f0fdfa] ring-4 ring-[#36c0c9]/10',
  },
  {
    value: 'reject',
    title: 'Reject request',
    hint: 'Close the request with a recorded reason.',
    selected: 'border-red-400 bg-red-50/60 ring-4 ring-red-500/10',
  },
]

export const BriefDecision: React.FC<BriefDecisionProps> = ({
  agentRecommendation,
  onSubmit,
  onBack,
  submitted,
  className = '',
}) => {
  const [choice, setChoice] = useState<BriefDecisionChoice | null>(null)
  const [rationale, setRationale] = useState('')

  const locked = Boolean(submitted)
  const selected = submitted?.decision ?? choice
  const text = submitted ? (submitted.rationale ?? '') : rationale
  const canSubmit = Boolean(choice) && rationale.trim().length > 0

  return (
    <section
      aria-labelledby="brief-decision-heading"
      className={`flex flex-col gap-5 ${className}`.trim()}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#475569] flex items-center justify-center shrink-0">
          <User className="w-[18px] h-[18px]" aria-hidden="true" />
        </div>
        <h3 id="brief-decision-heading" className="text-base font-semibold text-[#0d212c]">
          Your decision{!locked && <span className="text-red-500 font-semibold"> *</span>}
        </h3>
      </div>

      <div
        role="radiogroup"
        aria-label="Your decision"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.value
          const hinted =
            !locked && agentRecommendation === (opt.value === 'approve' ? 'proceed' : 'reject')
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={locked}
              onClick={() => setChoice(opt.value)}
              className={`p-4 rounded-xl border flex items-start gap-3 text-left transition-all duration-200 ${
                isSelected ? opt.selected : 'border-[#d6dee6] bg-white'
              } ${locked ? 'cursor-default' : 'cursor-pointer hover:border-[#36c0c9]/60 hover:bg-slate-50'}`}
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
        <label htmlFor="decision-rationale" className="text-xs font-semibold text-[#475569]">
          Decision rationale{!locked && <span className="text-red-500 font-semibold"> *</span>}
        </label>
        <textarea
          id="decision-rationale"
          rows={3}
          maxLength={MAX}
          value={text}
          disabled={locked}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Explain the key reasons for your decision..."
          className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] leading-relaxed resize-none shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15 disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:shadow-none"
        />
        {!locked && (
          <span className="text-[11px] text-[#94a3b8] self-end">
            {rationale.length} / {MAX}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}
        {!locked && (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => choice && onSubmit(choice, rationale.trim())}
            className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-2"
          >
            Submit decision
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
