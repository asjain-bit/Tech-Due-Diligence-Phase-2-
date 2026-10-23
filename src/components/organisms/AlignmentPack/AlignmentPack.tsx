'use client'

/**
 * AlignmentPack — Organism
 * Generated once the signed NDA is uploaded: the brief, the interest summary and the strategy
 * assessment merged with the open questions, sent to the Director, sponsors and Strategy Team.
 * Used in: NdaDiscoveryStage
 */

import React from 'react'
import { Send } from 'lucide-react'
import {
  DEFAULT_INTERNAL_INTERESTS,
  DEFAULT_STRATEGY_MEMBERS,
  type PartnershipRequest,
} from '@/types/partnership.types'

const strategyResponseOf = (request: PartnershipRequest) =>
  (request.strategyTeamMembers?.length ? request.strategyTeamMembers : DEFAULT_STRATEGY_MEMBERS)[0]
    ?.strategyResponse
import type { AlignmentPackProps } from './AlignmentPack.types'

/** Questions still open after the brief, the internal answers and the strategy conditions */
export const buildOpenQuestions = (request: PartnershipRequest): string[] => {
  const questions: string[] = []
  const conditions = strategyResponseOf(request)?.finalDecisionNote
  if (conditions) questions.push(`Has the vendor confirmed this condition? ${conditions}`)
  if (request.overviewCards.regulatory.toLowerCase().includes('unclear')) {
    questions.push('Which regulatory approvals are in place for the target markets?')
  }
  questions.push(
    'Which hospital or site will pilot first, and who is the clinical owner there?',
    'Which baseline KPIs will the pilot be measured against?',
    'Who owns models that are tuned on M42 data?'
  )
  return questions
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-2 py-5 first:pt-0 last:pb-0">
    <h4 className="text-sm font-semibold text-[#0d212c]">{title}</h4>
    {children}
  </section>
)

export const AlignmentPack: React.FC<AlignmentPackProps> = ({ request, className = '' }) => {
  const reviewers = request.internalInterests?.length
    ? request.internalInterests
    : DEFAULT_INTERNAL_INTERESTS
  const responded = reviewers.filter((r) => r.status === 'Completed')
  const strategy = strategyResponseOf(request)
  const sponsors = request.sponsors
  const recipients = [
    'Director',
    sponsors ? `Sponsors: ${[sponsors.lead, ...sponsors.co].join(', ')}` : 'Sponsors',
    'Strategy Team',
  ]

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      <div className="flex items-center gap-2 flex-wrap pb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569]">
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          Sent to
        </span>
        {recipients.map((r) => (
          <span
            key={r}
            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200"
          >
            {r}
          </span>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-[#e2e8f0]">
        <Section title="Initial assessment brief">
          <p className="text-sm text-[#0d212c] leading-relaxed">
            {request.headline ?? request.solution}
          </p>
          <p className="text-xs text-[#64748b] leading-relaxed">
            {request.agentRecommendation?.rationale ??
              `${request.companyName} proposes ${request.solution}.`}
          </p>
        </Section>

        <Section title="Interest summary">
          <p className="text-sm text-[#0d212c]">
            {responded.length} of {reviewers.length} Internal Interest reviewers responded.
            {sponsors &&
              ` ${sponsors.lead} is the lead sponsor${
                sponsors.co.length ? `, with ${sponsors.co.join(', ')} as co-sponsors` : ''
              }.`}
          </p>
        </Section>

        <Section title="Strategy assessment">
          <p className="text-sm text-[#0d212c]">
            Decision: <span className="font-semibold">{strategy?.finalDecision ?? 'Pending'}</span>
          </p>
          {strategy?.finalDecisionNote && (
            <p className="text-xs text-[#64748b] leading-relaxed">
              Conditions: {strategy.finalDecisionNote}
            </p>
          )}
        </Section>

        <Section title="Open questions">
          <ul className="flex flex-col gap-1.5 list-disc pl-4 marker:text-slate-300">
            {buildOpenQuestions(request).map((q) => (
              <li key={q} className="text-sm text-[#475569] leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
