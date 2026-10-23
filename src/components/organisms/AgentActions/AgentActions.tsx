'use client'

/**
 * AgentActions — Organism
 * The checks the agent ran for a case, as a plain list separated by dividers. Every check starts expanded
 * with its findings and output, and can be collapsed. Confidence is always shown as a level, never a percentage.
 * Used in: AnalysisDrawer
 */

import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Gauge,
  History,
  Layers,
  ListChecks,
  Route,
  Scale,
  ShieldAlert,
  Target,
} from 'lucide-react'
import type { AgentActionIcon, AgentActionsProps, ConfidenceLevel } from './AgentActions.types'
import { buildAgentActions } from './agentActions.data'

const ICONS: Record<AgentActionIcon, React.ComponentType<{ className?: string }>> = {
  history: History,
  backlog: ListChecks,
  uae: Scale,
  screening: ShieldAlert,
  duplicate: Copy,
  classification: Route,
  maturity: Gauge,
  kpi: Target,
  commodity: Layers,
  brief: FileText,
}

/** Confidence is always shown as a level, never as a percentage */
export const ConfidenceBadge: React.FC<{ level: ConfidenceLevel; label?: string }> = ({
  level,
  label,
}) => (
  <span
    aria-label={`${label ?? 'Confidence'} ${level}`}
    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${
      level === 'High'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : level === 'Medium'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-slate-50 text-slate-600 border-slate-200'
    }`}
  >
    {level} confidence
  </span>
)

export const AgentActions: React.FC<AgentActionsProps> = ({
  request,
  actions: actionsProp,
  className = '',
}) => {
  const built = useMemo(() => buildAgentActions(request), [request])
  const actions = actionsProp ?? built
  // Every check starts expanded; the user can collapse the ones they do not need
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <ol
      aria-label="Agent checks"
      className={`flex flex-col divide-y divide-[#e2e8f0] ${className}`.trim()}
    >
      {actions.map((action) => {
        const isOpen = !collapsed[action.id]
        const Icon = ICONS[action.icon]
        const panelId = `agent-action-${action.id}`
        return (
          <li key={action.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(action.id)}
              className="w-full flex items-center gap-4 py-4 text-left cursor-pointer hover:bg-slate-50/60 transition"
            >
              <Icon className="w-5 h-5 text-[#36c0c9] shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#0d212c]">{action.title}</span>
                  {action.status === 'attention' && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200">
                      Needs attention
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#64748b] leading-relaxed">{action.headline}</span>
              </div>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 ${
                  action.status === 'attention' ? 'bg-amber-400' : 'bg-[#10b981]'
                }`}
              >
                {action.status === 'attention' ? (
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={panelId}
                className="pl-9 pb-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <dl className="flex flex-col gap-3">
                  {action.findings.map((f) => (
                    <div key={f.label} className="flex flex-col gap-0.5">
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        {f.label}
                      </dt>
                      <dd className="text-xs text-[#0d212c] leading-relaxed">{f.value}</dd>
                    </div>
                  ))}

                  {action.stakeholders && action.stakeholders.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        Suggested reviewers
                      </dt>
                      <dd>
                        <ul className="flex flex-col divide-y divide-[#f1f5f9]">
                          {action.stakeholders.map((s) => (
                            <li
                              key={s.name}
                              className="py-2 flex items-start justify-between gap-4 flex-wrap"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0 max-w-sm">
                                <span className="text-xs font-semibold text-[#0d212c]">
                                  {s.name}
                                  <span className="font-normal text-[#64748b]"> · {s.role}</span>
                                </span>
                                <span className="text-xs text-[#64748b] leading-relaxed">
                                  {s.reason}
                                </span>
                              </div>
                              <ConfidenceBadge level={s.confidence} label={`Match for ${s.name}`} />
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5">
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                      Output
                    </dt>
                    <dd className="text-xs text-[#0d212c] leading-relaxed">{action.output}</dd>
                  </div>
                </dl>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
