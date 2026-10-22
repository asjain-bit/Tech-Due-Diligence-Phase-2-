'use client'

/**
 * JudgementForm — Organism
 * Strategy judgement across seven criteria (agent pre-filled, edits need a reason) plus the
 * final strategic-fit decision. Editable for the Strategy Team, readOnly for review.
 * Used in: PartnershipDetail
 */

import React from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import {
  JUDGEMENT_CRITERIA,
  STRATEGY_DECISION_OPTIONS,
  isJudgementEdited,
} from '@/types/judgementCriteria'
import type { JudgementFormProps } from './JudgementForm.types'

const FIELD =
  'w-full rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] shadow-2xs transition focus:outline-none hover:border-[#bcc7d3] focus:border-[#a3b1c2] focus:ring-0 disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:shadow-none disabled:cursor-default'

const REASON_MAX = 300

export const JudgementForm: React.FC<JudgementFormProps> = ({
  entries,
  onEntryChange,
  decision,
  onDecisionChange,
  decisionNote,
  onDecisionNoteChange,
  readOnly = false,
  onSubmit,
  className = '',
}) => {
  const missingReasons = JUDGEMENT_CRITERIA.filter(
    (c) => isJudgementEdited(c, entries[c.id]) && !entries[c.id]?.reason.trim()
  ).length
  const missingDecision = !decision
  const missingNote = Boolean(decision) && !decisionNote.trim()
  const canSubmit = missingReasons === 0 && !missingDecision && !missingNote

  const pending: string[] = []
  if (missingReasons > 0)
    pending.push(`a reason for ${missingReasons} changed judgement${missingReasons > 1 ? 's' : ''}`)
  if (missingDecision) pending.push('your final decision')
  else if (missingNote) pending.push('the decision summary')

  return (
    <div className={`flex flex-col gap-6 ${className}`.trim()}>
      {/* Criteria */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col divide-y divide-[#f1f5f9]">
        {JUDGEMENT_CRITERIA.map((criterion, idx) => {
          const entry = entries[criterion.id] ?? { value: criterion.agentValue, reason: '' }
          const edited = isJudgementEdited(criterion, entry)
          const reasonMissing = edited && !entry.reason.trim() && !readOnly
          return (
            <div
              key={criterion.id}
              className={`${idx === 0 ? 'pb-6' : 'py-6'} flex flex-col gap-4`}
              data-testid={`criterion-${criterion.id}`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-sm font-semibold text-[#0d212c]">
                  <span className="text-[#94a3b8] font-medium mr-2">{idx + 1}.</span>
                  {criterion.title}
                </h3>
                {edited ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Manually edited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Agent pre-filled
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5 flex flex-col gap-1.5">
                <div className="text-xs text-[#475569] leading-relaxed">
                  <span className="font-semibold text-[#0d212c]">
                    Agent chose &ldquo;{criterion.agentValue}&rdquo; because:
                  </span>{' '}
                  {criterion.agentRationale}
                </div>
                <div className="text-[11px] text-[#94a3b8]">Source: {criterion.agentSource}</div>
              </div>

              <div className="flex flex-col gap-1.5 sm:max-w-sm">
                <label
                  htmlFor={`judgement-${criterion.id}`}
                  className="text-xs font-semibold text-[#475569]"
                >
                  Your judgement
                </label>
                <div className="relative">
                  <select
                    id={`judgement-${criterion.id}`}
                    value={entry.value}
                    disabled={readOnly}
                    onChange={(e) => onEntryChange?.(criterion.id, { value: e.target.value })}
                    className={`${FIELD} h-11 appearance-none pl-3.5 pr-10 font-medium cursor-pointer`}
                  >
                    {criterion.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>

              {edited && (
                <div className="flex flex-col gap-1.5 w-full animate-in fade-in">
                  <label
                    htmlFor={`judgement-reason-${criterion.id}`}
                    className="text-xs font-semibold text-[#475569]"
                  >
                    {readOnly ? 'Reason for changing' : 'Why are you changing this?'}
                    {!readOnly && <span className="text-red-500 font-semibold"> *</span>}
                  </label>
                  <textarea
                    id={`judgement-reason-${criterion.id}`}
                    rows={2}
                    maxLength={REASON_MAX}
                    value={entry.reason}
                    disabled={readOnly}
                    onChange={(e) => onEntryChange?.(criterion.id, { reason: e.target.value })}
                    placeholder={`The agent suggested "${criterion.agentValue}". Explain why you chose "${entry.value}".`}
                    className={`${FIELD} p-3.5 leading-relaxed resize-none ${
                      reasonMissing ? 'border-amber-300' : ''
                    }`}
                  />
                  {reasonMissing && (
                    <span className="text-[11px] text-amber-700">
                      A reason is required for any judgement you change.
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Final decision */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-[#0d212c]">
            Is this solution a strategic fit, and should we proceed?
            {!readOnly && <span className="text-red-500 font-semibold"> *</span>}
          </h3>
          <p className="text-xs text-[#64748b]">
            Your decision goes to the Director together with the judgements above.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Final decision"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {STRATEGY_DECISION_OPTIONS.map((opt) => {
            const selected = decision === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={readOnly}
                onClick={() => onDecisionChange?.(opt.value)}
                className={`p-4 rounded-xl border flex items-start gap-3 text-left transition ${
                  selected ? 'border-[#94a3b8] bg-white' : 'border-[#d6dee6] bg-white'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-[#bcc7d3] hover:bg-slate-50'}`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selected ? 'border-[#36c0c9] bg-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-[#36c0c9]" />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#0d212c]">{opt.value}</span>
                  <span className="text-xs text-[#64748b] leading-snug">{opt.hint}</span>
                </span>
              </button>
            )
          })}
        </div>

        {decision && (
          <div className="flex flex-col gap-1.5 animate-in fade-in">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label htmlFor="decision-note" className="text-xs font-semibold text-[#475569]">
                {decision === 'Proceed with a condition'
                  ? 'Condition and summary'
                  : decision === 'No'
                    ? 'Reason for declining'
                    : 'Decision summary'}
                {!readOnly && <span className="text-red-500 font-semibold"> *</span>}
              </label>
              {!readOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0369a1]">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Drafted by the agent. Edit if needed.
                </span>
              )}
            </div>
            <textarea
              id="decision-note"
              rows={3}
              maxLength={REASON_MAX}
              value={decisionNote}
              disabled={readOnly}
              onChange={(e) => onDecisionNoteChange?.(e.target.value)}
              placeholder="Summarise your decision in a sentence or two."
              className={`${FIELD} p-3.5 leading-relaxed resize-none`}
            />
            {!readOnly && (
              <span className="text-[11px] text-[#94a3b8] self-end">
                {decisionNote.length}/{REASON_MAX}
              </span>
            )}
          </div>
        )}

        {!readOnly && (
          <div className="flex items-center justify-between gap-4 flex-wrap pt-5 border-t border-[#f1f5f9]">
            <span className="text-xs text-[#64748b]">
              {pending.length > 0 ? `Still needed: ${pending.join(', ')}.` : 'Ready to submit.'}
            </span>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Submit decision</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
