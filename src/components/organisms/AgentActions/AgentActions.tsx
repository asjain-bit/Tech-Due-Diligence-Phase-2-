'use client'

/**
 * AgentActions — Organism
 * Step-by-step log of what the agent did before the request reached the Director:
 * duplicate check, classification, maturity, KPI mapping, baseline, commodity test, brief.
 * Used in: PartnershipDetail
 */

import React, { useMemo, useState } from 'react'
import { AlertCircle, Check, ChevronDown, Sparkles } from 'lucide-react'
import type { AgentActionStatus, AgentActionsProps } from './AgentActions.types'
import { buildAgentActions } from './agentActions.data'

const STATUS_STYLE: Record<AgentActionStatus, { label: string; chip: string }> = {
  passed: {
    label: 'Passed',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  attention: {
    label: 'Needs attention',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  complete: {
    label: 'Complete',
    chip: 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]',
  },
}

const levelOf = (c: number) => (c >= 80 ? 'High' : c >= 50 ? 'Medium' : 'Low')

const ConfidenceMeter: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div className="flex items-center gap-2" aria-label={`${label ?? 'Confidence'} ${value}%`}>
    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-[#36c0c9]" style={{ width: `${value}%` }} />
    </div>
    <span className="text-[11px] font-semibold text-[#0d212c] tabular-nums">{value}%</span>
    <span className="text-[11px] text-[#64748b]">{levelOf(value)}</span>
  </div>
)

export const AgentActions: React.FC<AgentActionsProps> = ({ request, className = '' }) => {
  const actions = useMemo(() => buildAgentActions(request), [request])
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const allOpen = actions.every((a) => open[a.id])

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  const toggleAll = () =>
    setOpen(Object.fromEntries(actions.map((a) => [a.id, !allOpen])) as Record<string, boolean>)

  return (
    <section
      aria-labelledby="agent-actions-heading"
      className={`flex flex-col gap-4 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h3
            id="agent-actions-heading"
            className="text-base font-semibold text-[#0d212c] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#36c0c9]" aria-hidden="true" />
            Agent Actions
          </h3>
          <p className="text-xs text-[#64748b]">
            Everything the agent checked before this request reached you. Open a step to see the
            detail and its output.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <ol className="flex flex-col">
        {actions.map((action, idx) => {
          const isOpen = Boolean(open[action.id])
          const isLast = idx === actions.length - 1
          const style = STATUS_STYLE[action.status]
          const panelId = `agent-action-${action.id}`
          return (
            <li key={action.id} className="flex gap-4">
              {/* Rail */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    action.status === 'attention'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-[#10b981] border-[#10b981] text-white'
                  }`}
                >
                  {action.status === 'attention' ? (
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                  )}
                </div>
                {!isLast && <div className="w-[2px] flex-1 bg-[#e2e8f0] my-1" />}
              </div>

              {/* Card */}
              <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-4'}`}>
                <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(action.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#0d212c]">{action.title}</span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${style.chip}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <span className="text-xs text-[#475569] truncate">{action.headline}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {action.confidence !== undefined && (
                        <ConfidenceMeter value={action.confidence} />
                      )}
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className="px-4 pb-4 pt-1 flex flex-col gap-4 border-t border-[#f1f5f9] animate-in fade-in"
                    >
                      <p className="text-xs text-[#64748b] pt-3">
                        <span className="font-semibold text-[#0d212c]">
                          What the agent checked:{' '}
                        </span>
                        {action.check}
                      </p>

                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        {action.findings.map((f) => (
                          <div
                            key={f.label}
                            className={`flex flex-col gap-0.5 ${
                              f.value.length > 70 ? 'sm:col-span-2' : ''
                            }`}
                          >
                            <dt className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                              {f.label}
                            </dt>
                            <dd className="text-xs text-[#0d212c] leading-relaxed">{f.value}</dd>
                          </div>
                        ))}
                      </dl>

                      {action.stakeholders && action.stakeholders.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                            Suggested reviewers
                          </div>
                          <ul className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
                            {action.stakeholders.map((s) => (
                              <li
                                key={s.name}
                                className="px-3.5 py-2.5 flex items-start justify-between gap-4 flex-wrap"
                              >
                                <div className="flex flex-col gap-0.5 min-w-0 max-w-md">
                                  <span className="text-xs font-semibold text-[#0d212c]">
                                    {s.name}
                                    <span className="font-normal text-[#64748b]"> · {s.role}</span>
                                  </span>
                                  <span className="text-xs text-[#64748b] leading-relaxed">
                                    {s.reason}
                                  </span>
                                </div>
                                <ConfidenceMeter
                                  value={s.confidence}
                                  label={`Match for ${s.name}`}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-xl bg-[#f0f9fa] border-l-4 border-[#36c0c9] px-3.5 py-3 flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0e7490]">
                          Output
                        </span>
                        <p className="text-xs text-[#0d212c] leading-relaxed">{action.output}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
