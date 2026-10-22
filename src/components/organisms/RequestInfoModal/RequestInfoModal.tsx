'use client'

/**
 * RequestInfoModal — Organism
 * Email template the Director can edit and send to the vendor when more information is
 * needed. Sending puts the case on hold.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useState } from 'react'
import { Mail, Send, X } from 'lucide-react'
import type { RequestInfoModalProps } from './RequestInfoModal.types'

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  request,
  reason,
  senderName,
  onSend,
  onClose,
}) => {
  const to = request.companyInfo.email
  const [subject, setSubject] = useState(
    `More information needed: ${request.requestCode} ${request.companyName}`
  )
  const [body, setBody] = useState(
    [
      `Hi ${request.companyInfo.name},`,
      '',
      `Thank you for your partnership request (${request.requestCode}) for "${request.solution}". Before we can take it forward, we need a little more information:`,
      '',
      reason,
      '',
      'Please reply to this email with the details. Your request is on hold until we hear from you.',
      '',
      'Kind regards,',
      senderName,
      'Director, Partnerships',
      'M42',
    ].join('\n')
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSend = subject.trim().length > 0 && body.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-info-title"
        className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="request-info-title" className="text-lg font-semibold text-[#0d212c]">
                Request more information
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Review the email, then send it. The case goes on hold until the vendor replies.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close request information"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#475569]">To</span>
            <div className="px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-slate-50 text-sm text-[#0d212c]">
              {request.companyInfo.name} &lt;{to}&gt;
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="info-subject" className="text-xs font-semibold text-[#475569]">
              Subject
            </label>
            <input
              id="info-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="info-body" className="text-xs font-semibold text-[#475569]">
              Message
            </label>
            <textarea
              id="info-body"
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[#d6dee6] bg-white text-sm text-[#0d212c] leading-relaxed resize-none shadow-2xs transition focus:outline-none focus:border-[#36c0c9] focus:ring-4 focus:ring-[#36c0c9]/15"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSend}
            onClick={() => onSend({ to, subject: subject.trim(), body })}
            className="px-5 py-2.5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs cursor-pointer transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            Send &amp; put on hold
          </button>
        </div>
      </div>
    </div>
  )
}
