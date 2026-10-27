'use client'

/**
 * ValueDueDiligenceStage — Organism
 * Stage 5: the value assessment call (confirmed by the sponsor), the business case upload, the
 * sponsor's Proceed or Reject decision, the TDD report the agent fills in, and the sponsor's final
 * answer on whether to sponsor the partnership.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import { CheckCircle2, FileText, X } from 'lucide-react'
import { Checkbox } from '@/components/atoms/Checkbox'
import { FilePicker } from '@/components/molecules/FilePicker'
import { TddReport } from '@/components/organisms/TddReport'
import { ThinkingMode } from '@/components/organisms/ThinkingMode'
import { StageFooter } from '@/components/molecules/StageFooter'
import { StrategyDecisionModal } from '@/components/organisms/StrategyDecisionModal'
import type { ValueDueDiligenceStageProps } from './ValueDueDiligenceStage.types'

const TDD_MESSAGES = [
  'Collecting security documentation',
  'Reviewing architecture and integration',
  'Checking data residency',
  'Preparing the report',
]

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-[#0d212c]">{title}</h3>
      {subtitle && <p className="text-xs text-[#64748b]">{subtitle}</p>}
    </div>
    {children}
  </section>
)

const Done: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
    {children}
  </span>
)

export const ValueDueDiligenceStage: React.FC<ValueDueDiligenceStageProps> = ({
  request,
  role,
  onAction,
  className = '',
}) => {
  const isSponsor = role === 'sponsor'
  const value = request.value ?? {}
  const decision = value.decision
  const final = value.finalDecision
  const [modal, setModal] = useState<'proceed' | 'reject' | null>(null)

  const needsDecision = Boolean(value.businessCase) && !decision

  return (
    <div className={`flex flex-col gap-10 w-full ${className}`.trim()}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0d212c]">Value & Due Diligence</h2>
        <p className="text-xs text-[#64748b]">
          The value assessment call and business case come first. If the sponsor proceeds, the
          technical due diligence report is filled in and the sponsor gives a final answer.
        </p>
      </div>

      <Section
        title="Value assessment call"
        subtitle="The call happens outside the portal. Confirm it took place."
      >
        {value.callConfirmedOn ? (
          <Done>Value assessment call completed on {value.callConfirmedOn}</Done>
        ) : isSponsor ? (
          <Checkbox
            checked={false}
            onChange={() => onAction({ type: 'confirmValueCall' })}
            label="I confirm the value assessment call has been completed"
          />
        ) : (
          <span className="text-xs text-[#64748b]">Waiting for the lead sponsor.</span>
        )}
      </Section>

      {value.callConfirmedOn && (
        <Section title="Business case">
          {value.businessCase ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
              <FileText className="w-5 h-5 text-[#2563eb] shrink-0" aria-hidden="true" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[#0d212c] truncate">
                  {value.businessCase.name}
                </span>
                <span className="text-xs text-[#64748b]">
                  {value.businessCase.uploadedBy} · {value.businessCase.uploadedOn}
                </span>
              </div>
            </div>
          ) : isSponsor ? (
            <FilePicker
              label="Upload business case"
              hint="PDF, Word, PowerPoint or Excel"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onPick={(names) => onAction({ type: 'businessCase', name: names[0] })}
            />
          ) : (
            <span className="text-xs text-[#64748b]">Waiting for the lead sponsor.</span>
          )}
        </Section>
      )}

      {value.businessCase && (
        <Section title="Sponsor decision">
          {decision ? (
            <div className="flex flex-col gap-1.5 self-start">
              <span
                className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  decision.status === 'proceeded'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {decision.status === 'proceeded' ? 'Proceeded' : 'Rejected'} on {decision.date}
              </span>
              {decision.reason && (
                <p className="text-sm text-[#475569] leading-relaxed">{decision.reason}</p>
              )}
            </div>
          ) : (
            <span className="text-xs text-[#64748b]">
              {isSponsor
                ? 'Review the business case, then proceed or reject.'
                : 'Waiting for the lead sponsor to decide.'}
            </span>
          )}
        </Section>
      )}

      {decision?.status === 'proceeded' && (
        <Section title="Technical due diligence">
          {value.tddGeneratedOn ? (
            <>
              <Done>TDD report generated on {value.tddGeneratedOn}</Done>
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6">
                <TddReport request={request} />
              </div>
            </>
          ) : (
            <ThinkingMode
              inline
              eyebrow="GENERATING"
              description="The agent is preparing the technical due diligence report."
              messages={TDD_MESSAGES}
              stepMs={1100}
              onComplete={() => onAction({ type: 'generateTdd' })}
            />
          )}
        </Section>
      )}

      {value.tddGeneratedOn && (
        <Section title="Sponsorship">
          {final ? (
            <span
              className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border text-xs font-medium ${
                final.status === 'sponsored'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {final.status === 'sponsored' ? 'Sponsored' : 'Declined'} on {final.date}
            </span>
          ) : (
            <span className="text-xs text-[#64748b]">
              {isSponsor
                ? 'Review the report, then say whether you will sponsor this partnership.'
                : 'Waiting for the sponsor to answer.'}
            </span>
          )}
        </Section>
      )}

      {isSponsor && needsDecision && (
        <StageFooter>
          <span className="text-sm text-[#475569]">
            Review the business case, then record your decision.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModal('reject')}
              className="h-10 px-5 rounded-lg border border-red-500 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setModal('proceed')}
              className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              Proceed
            </button>
          </div>
        </StageFooter>
      )}

      {isSponsor && value.tddGeneratedOn && !final && (
        <StageFooter>
          <span className="text-sm text-[#475569]">Do you want to sponsor this partnership?</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onAction({ type: 'finalSponsor', sponsor: false })}
              className="h-10 px-5 rounded-lg border border-red-500 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition"
            >
              No, do not sponsor
            </button>
            <button
              type="button"
              onClick={() => onAction({ type: 'finalSponsor', sponsor: true })}
              className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition"
            >
              Yes, sponsor
            </button>
          </div>
        </StageFooter>
      )}

      {modal && (
        <StrategyDecisionModal
          mode={modal}
          onClose={() => setModal(null)}
          onConfirm={(reason) => {
            onAction({
              type: 'valueDecision',
              status: modal === 'proceed' ? 'proceeded' : 'rejected',
              reason,
            })
            setModal(null)
          }}
        />
      )}
    </div>
  )
}
