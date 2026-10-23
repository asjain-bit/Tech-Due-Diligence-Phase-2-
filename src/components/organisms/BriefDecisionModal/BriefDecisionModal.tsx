'use client'

/**
 * BriefDecisionModal — Organism
 * Popup where the Director records a decision on the initial assessment brief. Approving
 * makes the reason optional, rejecting makes it mandatory, and requesting more information
 * shows the email template in the same popup, with a copy button on each field. The body scrolls inside the popup.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { CopyButton } from '@/components/molecules/CopyButton'
import type { BriefDecisionChoice, BriefDecisionModalProps } from './BriefDecisionModal.types'

const MAX = 500

const OPTIONS: {
  value: BriefDecisionChoice
  title: string
  hint: string
  label: string
  placeholder: string
  action: string
}[] = [
  {
    value: 'approve',
    title: 'Approve for internal review',
    hint: 'Send to the Internal Interest team first.',
    label: 'Reason (optional)',
    placeholder: 'Add a note for the record...',
    action: 'Approve',
  },
  {
    value: 'reject',
    title: 'Reject request',
    hint: 'Close the request with a recorded reason.',
    label: 'Reason',
    placeholder: 'Explain the key reasons for rejecting...',
    action: 'Reject request',
  },
  {
    value: 'request_info',
    title: 'Request more info',
    hint: 'Email the vendor and mark the case Information Requested.',
    label: '',
    placeholder: '',
    action: 'Mark information requested',
  },
]

export const BriefDecisionModal: React.FC<BriefDecisionModalProps> = ({
  initialChoice,
  agentRecommendation,
  email,
  onSubmit,
  onRequestInfo,
  onClose,
}) => {
  const [choice, setChoice] = useState(initialChoice)
  const [reason, setReason] = useState('')
  const [subject, setSubject] = useState(email.subject)
  const [body, setBody] = useState(email.body)
  const titleId = useId()
  const current = OPTIONS.find((o) => o.value === choice) ?? OPTIONS[0]
  const reasonRequired = choice === 'reject'
  const isInfo = choice === 'request_info'
  const canSubmit = isInfo
    ? subject.trim().length > 0 && body.trim().length > 0
    : !reasonRequired || reason.trim().length > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between gap-3 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-[#e2e8f0] shrink-0">
          <h3 id={titleId} className="text-xl font-semibold text-[#0d212c]">
            Your decision
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close decision"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-5 flex flex-col gap-5">
          <div role="radiogroup" aria-label="Your decision" className="flex flex-col gap-2.5">
            {OPTIONS.map((opt) => {
              const selected = choice === opt.value
              const hinted =
                agentRecommendation ===
                (opt.value === 'approve'
                  ? 'proceed'
                  : opt.value === 'reject'
                    ? 'reject'
                    : undefined)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(opt.value)}
                  className="p-3.5 rounded-xl border border-[#d6dee6] bg-white hover:bg-slate-50 flex items-start gap-3 text-left transition cursor-pointer"
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selected ? 'border-[#36c0c9]' : 'border-slate-300'
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-[#36c0c9]" />}
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

          {isInfo ? (
            <div className="flex flex-col gap-4" aria-label="Email to the vendor" role="group">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#475569]">To</span>
                  <CopyButton text={email.to} label="recipient" />
                </div>
                <div className="px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-slate-50 text-sm text-[#0d212c]">
                  {email.to}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="info-subject" className="text-xs font-semibold text-[#475569]">
                    Subject
                  </label>
                  <CopyButton text={subject} label="subject" />
                </div>
                <input
                  id="info-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] shadow-2xs transition focus:outline-none hover:border-[#bcc7d3] focus:border-[#a3b1c2] focus:ring-0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="info-body" className="text-xs font-semibold text-[#475569]">
                    Message
                  </label>
                  <CopyButton text={body} label="message" />
                </div>
                <textarea
                  id="info-body"
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] leading-relaxed resize-none shadow-2xs transition focus:outline-none hover:border-[#bcc7d3] focus:border-[#a3b1c2] focus:ring-0"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="brief-decision-reason"
                className="text-xs font-semibold text-[#475569]"
              >
                {current.label}
                {reasonRequired && <span className="text-red-500 font-semibold"> *</span>}
              </label>
              <textarea
                id="brief-decision-reason"
                rows={4}
                maxLength={MAX}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={current.placeholder}
                className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] leading-relaxed resize-none shadow-2xs transition focus:outline-none hover:border-[#bcc7d3] focus:border-[#a3b1c2] focus:ring-0"
              />
              <span className="text-[11px] text-[#94a3b8] self-end">
                {reason.length} / {MAX}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-[#e2e8f0] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              choice === 'request_info'
                ? onRequestInfo({ to: email.to, subject: subject.trim(), body })
                : onSubmit(choice, reason.trim())
            }
            className={`h-10 px-5 rounded-lg text-sm font-semibold text-white shadow-xs transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer ${
              choice === 'reject'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#36c0c9] hover:bg-[#2fb0b9]'
            }`}
          >
            {current.action}
          </button>
        </div>
      </div>
    </div>
  )
}
