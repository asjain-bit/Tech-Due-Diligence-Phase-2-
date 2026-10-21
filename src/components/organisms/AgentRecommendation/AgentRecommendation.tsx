'use client'

/**
 * AgentRecommendation — Organism
 * The agent's verdict for a request: proceed or reject, confidence, reasoning and the signals
 * it weighed. Shown at the top of the Internal Assessment Brief.
 * Used in: PartnershipDetail
 */

import React from 'react'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import type { AgentRecommendationProps } from './AgentRecommendation.types'

export const AgentRecommendation: React.FC<AgentRecommendationProps> = ({
  request,
  className = '',
}) => {
  const rec = request.agentRecommendation
  if (!rec) return null

  const isReject = rec.status === 'reject'
  const level = rec.confidence >= 80 ? 'High' : rec.confidence >= 50 ? 'Medium' : 'Low'
  const cards = request.overviewCards

  const signals = [
    { label: 'Evidence', value: cards.evidence, ok: true },
    { label: 'Deployment', value: cards.deployment, ok: true },
    {
      label: 'Regulatory',
      value: cards.regulatory,
      ok: !cards.regulatory.toLowerCase().includes('unclear'),
    },
    {
      label: 'Duplicate check',
      value: cards.duplicateCheck,
      ok: cards.duplicateCheck.toLowerCase() === 'clear',
    },
  ]

  return (
    <section
      aria-labelledby="agent-recommendation-heading"
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col gap-5 ${
        isReject ? 'bg-red-50/40 border-red-200' : 'bg-[#f0fdfa]/60 border-[#ccfbf1]'
      } ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isReject ? 'bg-red-100 text-red-600' : 'bg-[#e6fffa] text-[#36c0c9]'
            }`}
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3
              id="agent-recommendation-heading"
              className="text-xs font-medium uppercase tracking-wider text-[#64748b]"
            >
              Agent recommendation
            </h3>
            <p className="text-lg font-semibold text-[#0d212c]">
              {isReject ? 'Reject this request' : 'Proceed to the next stage'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs text-[#64748b]">
            Confidence: <strong className="text-[#0d212c]">{level}</strong>
          </span>
          <div className="flex items-center gap-2">
            <div
              className="w-28 h-2 rounded-full bg-white overflow-hidden border border-[#e2e8f0]"
              role="img"
              aria-label={`Confidence ${rec.confidence} percent`}
            >
              <div
                className={`h-full rounded-full ${isReject ? 'bg-red-500' : 'bg-[#36c0c9]'}`}
                style={{ width: `${rec.confidence}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[#0d212c] tabular-nums">
              {rec.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[#0d212c]">Why</span>
        <p className="text-sm text-[#334155] leading-relaxed">{rec.rationale}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#0d212c]">What the agent weighed</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {signals.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white border border-[#e2e8f0] px-3.5 py-3 flex items-start gap-2.5"
            >
              {s.ok ? (
                <CheckCircle2
                  className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  {s.label}
                </span>
                <span className="text-xs font-medium text-[#0d212c] leading-snug">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#64748b]">
        The decision is yours. Whether you agree with the agent or not, a reason is required for
        both Proceed and Reject.
      </p>
    </section>
  )
}
