'use client'

/**
 * AdminDecision — Organism
 * The Partnership Admin's routing decision: reject, or proceed as Partnership, Procure or
 * M&A (each with the agent's confidence). Editable until the Director decides.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useState } from 'react'
import { ArrowRight, Pencil } from 'lucide-react'
import { ConfidenceBadge } from '@/components/organisms/AgentActions'
import type { CaseType } from '@/types/partnership.types'
import type { AdminDecisionProps } from './AdminDecision.types'

const MAX = 500

const TYPES: { value: CaseType; hint: string }[] = [
  { value: 'Partnership', hint: 'Pilot or co-develop with M42. Goes to the Director.' },
  { value: 'Procure', hint: 'Buy or license the solution. Goes to Procurement.' },
  { value: 'M&A', hint: 'Acquire or invest in the vendor. Goes to Corporate Development.' },
]

type Action = 'proceed' | 'reject'

const radioDot = (selected: boolean) => (
  <span
    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
      selected ? 'border-[#36c0c9] bg-white' : 'border-slate-300 bg-white'
    }`}
  >
    {selected && <span className="w-2 h-2 rounded-full bg-[#36c0c9]" />}
  </span>
)

export const AdminDecision: React.FC<AdminDecisionProps> = ({
  typeConfidence,
  submitted,
  canEdit,
  onSubmit,
  className = '',
}) => {
  const [editing, setEditing] = useState(false)
  const [action, setAction] = useState<Action | null>(submitted?.action ?? null)
  const [type, setType] = useState<CaseType | null>(submitted?.type ?? null)
  const [reason, setReason] = useState(submitted?.reason ?? '')

  // A newly recorded decision locks the form again
  useEffect(() => {
    setEditing(false)
  }, [submitted])

  const locked = Boolean(submitted) && !editing
  const canSubmit =
    Boolean(action) && reason.trim().length > 0 && (action === 'reject' || Boolean(type))

  const startEditing = () => {
    setAction(submitted?.action ?? null)
    setType(submitted?.type ?? null)
    setReason(submitted?.reason ?? '')
    setEditing(true)
  }

  const submit = () => {
    if (!action || !canSubmit) return
    onSubmit({
      action,
      type: action === 'proceed' ? (type ?? undefined) : undefined,
      reason: reason.trim(),
    })
  }

  return (
    <div className={`flex flex-col gap-5 ${className}`.trim()}>
      <div
        role="radiogroup"
        aria-label="Routing decision"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {(
          [
            { value: 'proceed', title: 'Proceed', hint: 'Choose where this case should go.' },
            {
              value: 'reject',
              title: 'Reject request',
              hint: 'Close the request with a recorded reason.',
            },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={action === opt.value}
            disabled={locked}
            onClick={() => setAction(opt.value)}
            className={`p-4 rounded-xl border border-[#d6dee6] bg-white flex items-start gap-3 text-left transition ${
              locked ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'
            }`}
          >
            {radioDot(action === opt.value)}
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#0d212c]">{opt.title}</span>
              <span className="text-xs text-[#64748b] leading-snug">{opt.hint}</span>
            </span>
          </button>
        ))}
      </div>

      {action === 'proceed' && (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
          <span className="text-xs font-semibold text-[#475569]">
            Case type{!locked && <span className="text-red-500 font-semibold"> *</span>}
          </span>
          <div
            role="radiogroup"
            aria-label="Case type"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={type === t.value}
                disabled={locked}
                onClick={() => setType(t.value)}
                className={`p-4 rounded-xl border border-[#d6dee6] bg-white flex items-start gap-3 text-left transition ${
                  locked ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'
                }`}
              >
                {radioDot(type === t.value)}
                <span className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#0d212c]">{t.value}</span>
                  <span className="text-xs text-[#64748b] leading-snug">{t.hint}</span>
                  <ConfidenceBadge
                    level={typeConfidence[t.value]}
                    label={`${t.value} confidence`}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-reason" className="text-xs font-semibold text-[#475569]">
          Reason{!locked && <span className="text-red-500 font-semibold"> *</span>}
        </label>
        <textarea
          id="admin-reason"
          rows={3}
          maxLength={MAX}
          value={reason}
          disabled={locked}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the key reasons for your decision..."
          className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] leading-relaxed resize-none shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15 disabled:bg-[#f8fafc] disabled:text-[#334155] disabled:opacity-100 disabled:shadow-none"
        />
        {!locked && (
          <span className="text-[11px] text-[#94a3b8] self-end">
            {reason.length} / {MAX}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        {locked ? (
          canEdit ? (
            <>
              <span className="text-xs text-[#64748b]">
                You can edit this until the Director decides.
              </span>
              <button
                type="button"
                onClick={startEditing}
                className="px-5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
                Edit submission
              </button>
            </>
          ) : (
            <span className="text-xs text-[#64748b]">
              The Director has decided, so this can no longer be changed.
            </span>
          )
        ) : (
          <>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm font-semibold text-[#64748b] hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-2"
            >
              {editing ? 'Update submission' : 'Submit decision'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
