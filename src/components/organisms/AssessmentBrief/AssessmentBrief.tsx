'use client'

/**
 * AssessmentBrief — Organism
 * The agent's initial assessment brief, written from what the vendor filled in on the
 * submission form: overview, highlights, asks from M42, track record and the agent verdict.
 * Used in: PartnershipDetail
 */

import React from 'react'
import {
  Building2,
  ExternalLink,
  FileText,
  HeartHandshake,
  Layers,
  Sparkles,
  Target,
  ShieldCheck,
  Users,
  Gauge,
  Lightbulb,
} from 'lucide-react'
import { getChangeFactors } from '@/components/organisms/AgentActions'
import type { AssessmentBriefProps } from './AssessmentBrief.types'

const splitList = (text: string) =>
  text
    .replace(/\.$/, '')
    .split(/,\s*(?:and\s+)?/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))

const levelOf = (c: number) => (c >= 80 ? 'High' : c >= 50 ? 'Medium' : 'Low')

export const AssessmentBrief: React.FC<AssessmentBriefProps> = ({
  request,
  onViewVendorResponse,
  children,
  className = '',
}) => {
  const { assessmentAreas: a, companyInfo: info, overviewCards: cards } = request
  const rec = request.agentRecommendation
  const isReject = rec?.status === 'reject'
  const asks = splitList(a.requestedM42Resources)
  const populations = [...(a.impactedPatientPopulations ?? []), ...(a.clinicalAreas ?? [])]

  const highlights: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: React.ReactNode
  }[] = [
    { icon: FileText, label: 'Proposed solution', value: a.productPlatformServiceDetails },
    {
      icon: Target,
      label: 'Focus areas',
      value: (
        <span className="flex flex-wrap gap-1.5">
          {a.focusAreas.map((f) => (
            <span
              key={f}
              className="px-2.5 py-0.5 rounded-lg bg-[#f0fdfa] text-[#0f766e] text-xs font-medium border border-[#ccfbf1]"
            >
              {f}
            </span>
          ))}
        </span>
      ),
    },
    {
      icon: Gauge,
      label: 'Current stage',
      value: `${request.solutionMaturity}. ${a.solutionMaturityLevelAndRegulatory}`,
    },
    {
      icon: ShieldCheck,
      label: 'Regulatory status',
      value: a.relevantApprovals || (a.regulatoryApprovalList ?? []).join(', ') || 'Not applicable',
    },
    { icon: Lightbulb, label: 'What sets it apart', value: a.noveltyAndDifferentiation },
    {
      icon: Layers,
      label: 'Development approach',
      value: a.developmentApproach || 'Not specified',
    },
    ...(populations.length > 0
      ? [{ icon: Users, label: 'Who it affects', value: populations.join(', ') }]
      : []),
  ]

  return (
    <section
      aria-labelledby="assessment-brief-heading"
      className={`flex flex-col gap-8 ${className}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 id="assessment-brief-heading" className="text-base font-semibold text-[#0d212c]">
            Initial Assessment Brief
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e0f2fe] text-[#0369a1]">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            AI-generated
          </span>
        </div>
        <button
          type="button"
          onClick={onViewVendorResponse}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
        >
          View vendor response
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Overview */}
      <div className="flex flex-col gap-2 pt-6 border-t border-[#f1f5f9]">
        <h3 className="text-sm font-semibold text-[#0d212c]">Overview</h3>
        <p className="text-sm text-[#475569] leading-relaxed max-w-4xl">
          {request.companyName} was founded in {info.yearFounded}
          {info.location ? ` (${info.location})` : ''} and is submitting &ldquo;{request.solution}
          &rdquo; at {request.solutionMaturity} maturity. On record: {cards.evidence.toLowerCase()},{' '}
          {cards.deployment}, and {cards.regulatory} for regulatory status.
        </p>
      </div>

      {/* Highlights and asks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-10 gap-y-8 pt-6 border-t border-[#f1f5f9]">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#0d212c]">Key highlights</h3>
          <dl className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-[#36c0c9] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-4 gap-y-0.5 flex-1 min-w-0">
                  <dt className="text-xs font-semibold text-[#0d212c] pt-1.5">{label}</dt>
                  <dd className="text-sm text-[#475569] leading-relaxed pt-0.5">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-7 lg:border-l lg:border-[#f1f5f9] lg:pl-10">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#0d212c] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#36c0c9]" aria-hidden="true" />
              What they ask from M42
            </h3>
            <ul className="flex flex-col gap-2">
              {asks.map((ask) => (
                <li
                  key={ask}
                  className="flex items-start gap-2.5 text-sm text-[#475569] leading-relaxed"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#36c0c9] mt-2 shrink-0"
                    aria-hidden="true"
                  />
                  {ask}
                </li>
              ))}
            </ul>
          </div>

          {a.milestones && a.milestones.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#0d212c]">Track record</h3>
              <ul className="flex flex-col gap-2">
                {a.milestones.map((m) => (
                  <li
                    key={m}
                    className="flex items-start gap-2.5 text-sm text-[#475569] leading-relaxed"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] mt-2 shrink-0"
                      aria-hidden="true"
                    />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Agent verdict */}
      {rec && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 flex flex-col gap-5 ${
            isReject ? 'bg-red-50/40 border-red-200' : 'bg-[#f0fdfa]/70 border-[#ccfbf1]'
          }`}
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
                <h3 className="text-sm font-semibold text-[#0d212c]">Agent verdict</h3>
                <p className="text-xs text-[#475569] leading-relaxed max-w-xl">
                  {isReject
                    ? 'Based on the checks, the agent recommends rejecting this request.'
                    : 'Based on the checks, the agent recommends proceeding to internal review.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#64748b]">Confidence level</span>
              <span
                className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${
                  isReject
                    ? 'bg-white text-red-700 border-red-200'
                    : 'bg-white text-emerald-700 border-emerald-200'
                }`}
              >
                {levelOf(rec.confidence)} · {rec.confidence}%
              </span>
            </div>
          </div>

          <p className="text-sm text-[#334155] leading-relaxed">{rec.rationale}</p>

          <div className="flex flex-col gap-2.5 pt-4 border-t border-black/5">
            <h4 className="text-xs font-semibold text-[#0d212c]">
              Three things that would change this recommendation
            </h4>
            <ol className="flex flex-col gap-2">
              {getChangeFactors(request).map((factor, i) => (
                <li
                  key={factor}
                  className="flex items-start gap-3 text-sm text-[#475569] leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-[#e2e8f0] text-[11px] font-semibold text-[#475569] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {factor}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {children && <div className="pt-6 border-t border-[#f1f5f9]">{children}</div>}
    </section>
  )
}
