'use client'

/**
 * QuestionnaireForm — Organism
 * Five-question internal interest questionnaire. The same layout is used to fill it in
 * (editable) and to view a submitted response (readOnly).
 * Used in: PartnershipDetail
 */

import React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { QuestionnaireFormProps } from './QuestionnaireForm.types'

export const KPI_OPTIONS = [
  'ICU sepsis mortality',
  '30-day readmission rate',
  'Time to antibiotic therapy',
  'Average length of stay (ALOS)',
  'Bed occupancy rate',
  'Emergency department wait time',
]
export const SPONSOR_OPTIONS = ['Yes, we would sponsor', 'No', 'Not sure yet']
export const BUDGET_OPTIONS = ['Existing budget line', 'Needs central funding', "Don't know"]

const FIELD =
  'w-full rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15 disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:shadow-none disabled:cursor-default'

const MAX_TEXT = 500

const Question = ({
  n,
  title,
  required,
  readOnly,
  children,
}: {
  readOnly: boolean
  n: number
  title: string
  required?: boolean
  children: React.ReactNode
}) => (
  <div className="py-8 first:pt-0 flex flex-col gap-4">
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
        {n}
      </div>
      <h3 className="text-sm font-medium text-[#0d212c] leading-relaxed">
        {title}
        {required && !readOnly && <span className="text-red-500 font-semibold"> *</span>}
      </h3>
    </div>
    <div className="pl-9 flex flex-col gap-4">{children}</div>
  </div>
)

const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-xs font-semibold text-[#475569]">
    {children}
  </label>
)

const TextArea = ({
  id,
  value,
  placeholder,
  onValue,
  readOnly,
}: {
  readOnly: boolean
  id: string
  value: string
  placeholder: string
  onValue: (v: string) => void
}) => (
  <div className="flex flex-col gap-1.5">
    <textarea
      id={id}
      rows={4}
      maxLength={MAX_TEXT}
      value={value}
      disabled={readOnly}
      onChange={(e) => onValue(e.target.value)}
      placeholder={placeholder}
      className={`${FIELD} p-3.5 leading-relaxed resize-none`}
    />
    {!readOnly && (
      <span className="text-[11px] text-[#94a3b8] self-end">
        {value.length}/{MAX_TEXT}
      </span>
    )}
  </div>
)

const RadioCards = ({
  name,
  options,
  value,
  onValue,
  readOnly,
}: {
  readOnly: boolean
  name: string
  options: string[]
  value: string
  onValue: (v: string) => void
}) => (
  <div role="radiogroup" aria-label={name} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {options.map((opt) => {
      const selected = value === opt
      return (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={readOnly}
          onClick={() => onValue(opt)}
          className={`px-4 py-3 rounded-xl border flex items-center gap-3 text-sm font-medium text-left transition ${
            selected
              ? 'border-[#36c0c9] bg-[#f0fdfa] text-[#0d212c] ring-4 ring-[#36c0c9]/10'
              : 'border-[#d6dee6] bg-white text-[#475569]'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-[#36c0c9]/60 hover:bg-slate-50'}`}
        >
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
              selected ? 'border-[#36c0c9] bg-white' : 'border-slate-300 bg-white'
            }`}
          >
            {selected && <span className="w-2 h-2 rounded-full bg-[#36c0c9]" />}
          </span>
          <span>{opt}</span>
        </button>
      )
    })}
  </div>
)

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  values,
  onChange,
  readOnly = false,
  onSubmit,
  onCancel,
  className = '',
}) => {
  const set = (patch: Partial<typeof values>) => onChange?.(patch)

  const requiredAnswered = [
    values.problem.trim(),
    values.kpi,
    values.baseline.trim(),
    values.change.trim(),
    values.sponsor,
    values.budget,
  ].filter(Boolean).length
  const requiredTotal = 6
  const canSubmit = requiredAnswered === requiredTotal

  return (
    <div
      className={`bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col ${className}`.trim()}
    >
      {!readOnly && (
        <div className="flex items-center justify-between gap-3 pb-6 mb-2 border-b border-[#f1f5f9]">
          <span className="text-xs text-[#64748b]">
            Fields marked <span className="text-red-500 font-semibold">*</span> are required.
          </span>
          <span className="text-xs font-medium text-[#475569]">
            {requiredAnswered} of {requiredTotal} required answered
          </span>
        </div>
      )}

      <div className="flex flex-col divide-y divide-[#f1f5f9]">
        <Question
          readOnly={readOnly}
          n={1}
          required
          title="Is this a real problem for you today, and what do you do about it now?"
        >
          <TextArea
            readOnly={readOnly}
            id="q1-problem"
            value={values.problem}
            onValue={(v) => set({ problem: v })}
            placeholder="Describe the current clinical or operational problem and existing workarounds..."
          />
        </Question>

        <Question
          readOnly={readOnly}
          n={2}
          required
          title="Which KPI would move, what is the baseline today, and what change would matter?"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q2-kpi">KPI</Label>
              <div className="relative">
                <select
                  id="q2-kpi"
                  value={values.kpi}
                  disabled={readOnly}
                  onChange={(e) => set({ kpi: e.target.value })}
                  className={`${FIELD} h-11 appearance-none pl-3.5 pr-10 cursor-pointer`}
                >
                  <option value="">Choose a KPI</option>
                  {KPI_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q2-baseline">Baseline today</Label>
              <input
                id="q2-baseline"
                type="text"
                value={values.baseline}
                disabled={readOnly}
                onChange={(e) => set({ baseline: e.target.value })}
                placeholder="e.g. 21% over 12 months"
                className={`${FIELD} h-11 px-3.5`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q2-change">Change that would matter</Label>
              <input
                id="q2-change"
                type="text"
                value={values.change}
                disabled={readOnly}
                onChange={(e) => set({ change: e.target.value })}
                placeholder="e.g. 3 points lower in 12 months"
                className={`${FIELD} h-11 px-3.5`}
              />
            </div>
          </div>
        </Question>

        <Question
          readOnly={readOnly}
          n={3}
          required
          title="Would you sponsor a pilot, who would the named sponsor be, and what capacity can you commit?"
        >
          <RadioCards
            readOnly={readOnly}
            name="Pilot sponsorship"
            options={SPONSOR_OPTIONS}
            value={values.sponsor}
            onValue={(v) => set({ sponsor: v })}
          />
        </Question>

        <Question
          readOnly={readOnly}
          n={4}
          required
          title="Is there a budget line, or would it need central funding?"
        >
          <RadioCards
            readOnly={readOnly}
            name="Budget funding"
            options={BUDGET_OPTIONS}
            value={values.budget}
            onValue={(v) => set({ budget: v })}
          />
        </Question>

        <Question readOnly={readOnly} n={5} title="What would make you say no?">
          <TextArea
            readOnly={readOnly}
            id="q5-sayno"
            value={values.sayNo}
            onValue={(v) => set({ sayNo: v })}
            placeholder="Identify dealbreakers, clinical blockers, integration risks, or IT hurdles..."
          />
        </Question>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#f1f5f9]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm font-semibold text-[#64748b] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
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
