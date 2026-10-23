'use client'

/**
 * ReviewQuestionnaire — Organism
 * The questions the Director sent, one answer box each. Same layout to answer them
 * (editable) and to read a submitted response (readOnly).
 * Used in: PartnershipDetail
 */

import React from 'react'
import { Check } from 'lucide-react'
import type { ReviewQuestionnaireProps } from './ReviewQuestionnaire.types'

const MAX = 600

export const ReviewQuestionnaire: React.FC<ReviewQuestionnaireProps> = ({
  questions,
  answers,
  onChange,
  readOnly = false,
  onSubmit,
  className = '',
}) => {
  const mandatory = questions.filter((q) => q.mandatory)
  const done = mandatory.filter((q) => Boolean(answers[q.id]?.answer.trim())).length
  const canSubmit = questions.length > 0 && done === mandatory.length

  return (
    <div
      className={`bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col ${className}`.trim()}
    >
      {!readOnly && (
        <div className="flex items-center justify-between gap-3 pb-6 mb-2 border-b border-[#f1f5f9]">
          <span className="text-xs text-[#64748b]">Questions marked * are mandatory.</span>
          <span className="text-xs font-medium text-[#475569]">
            {done} of {mandatory.length} mandatory answered
          </span>
        </div>
      )}

      <ol className="flex flex-col divide-y divide-[#f1f5f9]">
        {questions.map((q, i) => {
          const value = answers[q.id] ?? { answer: '' }
          return (
            <li key={q.id} className="py-7 first:pt-0 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`answer-${q.id}`}
                    className="text-sm font-medium text-[#0d212c] leading-relaxed"
                  >
                    {q.text}
                    {!readOnly && q.mandatory && (
                      <span className="text-red-500 font-semibold"> *</span>
                    )}
                  </label>
                  <p className="text-xs text-[#64748b] leading-relaxed">{q.cue}</p>
                </div>
              </div>

              <div className="pl-9 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <textarea
                    id={`answer-${q.id}`}
                    rows={3}
                    maxLength={MAX}
                    value={value.answer}
                    disabled={readOnly}
                    onChange={(e) => onChange?.(q.id, { answer: e.target.value })}
                    placeholder="Type your answer..."
                    className="w-full p-3 rounded-lg border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] leading-relaxed resize-none transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2] disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:hover:border-[#d6dee6]"
                  />
                  {!readOnly && (
                    <span className="text-[11px] text-[#94a3b8] self-end">
                      {value.answer.length}/{MAX}
                    </span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {!readOnly && (
        <div className="flex items-center justify-end pt-6 border-t border-[#f1f5f9]">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>Submit</span>
          </button>
        </div>
      )}
    </div>
  )
}
