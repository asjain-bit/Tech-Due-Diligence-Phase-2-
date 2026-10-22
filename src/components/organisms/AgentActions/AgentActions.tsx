'use client'

/**
 * AgentActions — Organism
 * The agent's checklist for a request. Plays as a step-by-step run (context first, then each
 * check) and settles into an expandable list of what the agent checked and found.
 * Used in: PartnershipDetail, AnalysisDrawer
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Gauge,
  History,
  Layers,
  ListChecks,
  Loader2,
  Route,
  Scale,
  ShieldAlert,
  Target,
} from 'lucide-react'
import type { AgentActionIcon, AgentActionsProps, ConfidenceLevel } from './AgentActions.types'
import { AGENT_CONTEXT_SOURCES, buildAgentActions } from './agentActions.data'

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

const SOURCE_MS = 260
const CHECK_MS = 1000

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
  showHeader = true,
  showSources = true,
  animate = false,
  onComplete,
  className = '',
}) => {
  const built = useMemo(() => buildAgentActions(request), [request])
  const actions = actionsProp ?? built
  const sourceCount = showSources ? AGENT_CONTEXT_SOURCES.length : 0
  const total = sourceCount + actions.length

  const [step, setStep] = useState(() => (animate && !prefersReducedMotion() ? 0 : total))
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const running = step < total

  useEffect(() => {
    if (!animate || step >= total) return
    const timer = setTimeout(() => setStep((s) => s + 1), step < sourceCount ? SOURCE_MS : CHECK_MS)
    return () => clearTimeout(timer)
  }, [animate, step, total, sourceCount])

  useEffect(() => {
    if (animate && step >= total) onCompleteRef.current?.()
  }, [animate, step, total])

  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <section
      aria-labelledby={showHeader ? 'agent-actions-heading' : undefined}
      aria-label={showHeader ? undefined : 'Agent checks'}
      className={`flex flex-col gap-6 ${className}`.trim()}
    >
      {showHeader && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 id="agent-actions-heading" className="text-base font-semibold text-[#0d212c]">
                Agent Actions
              </h2>
              <p className="text-xs text-[#64748b]" aria-live="polite">
                {running
                  ? `Reviewing the submission from ${request.companyName}`
                  : 'Analysis complete. Preparing the initial assessment brief…'}
              </p>
            </div>
          </div>

          {running && (
            <button
              type="button"
              onClick={() => setStep(total)}
              className="text-xs font-medium text-[#64748b] hover:text-[#0d212c] cursor-pointer transition"
            >
              Skip
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {running && (
        <div
          role="progressbar"
          aria-label="Agent progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
          className="h-1 w-full rounded-full bg-slate-100 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-[#36c0c9] transition-[width] duration-500 ease-out"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      )}

      {/* Context the agent reads */}
      {showSources && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
            Reading
          </span>
          <ul className="flex flex-wrap gap-2">
            {AGENT_CONTEXT_SOURCES.map((source, i) => {
              const state = step > i ? 'done' : step === i ? 'running' : 'pending'
              return (
                <li
                  key={source}
                  data-state={state}
                  className={`inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
                    state === 'pending'
                      ? 'bg-white border-[#e2e8f0] text-[#94a3b8]'
                      : state === 'running'
                        ? 'bg-[#f0fdfa] border-[#36c0c9] text-[#0f766e]'
                        : 'bg-white border-[#e2e8f0] text-[#0d212c]'
                  }`}
                >
                  {state === 'done' ? (
                    <Check
                      className="w-3.5 h-3.5 text-[#10b981] animate-in zoom-in-50 duration-300"
                      aria-hidden="true"
                    />
                  ) : state === 'running' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1] mx-1"
                      aria-hidden="true"
                    />
                  )}
                  {source}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Checks */}
      <ol className="flex flex-col gap-3">
        {actions.map((action, idx) => {
          const globalIndex = sourceCount + idx
          const state = step > globalIndex ? 'done' : step === globalIndex ? 'running' : 'pending'
          const isOpen = Boolean(open[action.id]) && state === 'done'
          const Icon = ICONS[action.icon]
          const panelId = `agent-action-${action.id}`
          return (
            <li
              key={action.id}
              data-state={state}
              className={`rounded-xl border bg-white transition-all duration-300 ${
                state === 'running'
                  ? 'border-[#36c0c9] ring-4 ring-[#36c0c9]/15'
                  : 'border-[#e2e8f0] shadow-2xs'
              } ${state === 'pending' ? 'opacity-50' : ''}`}
            >
              <button
                type="button"
                disabled={state !== 'done'}
                aria-expanded={state === 'done' ? isOpen : undefined}
                aria-controls={state === 'done' ? panelId : undefined}
                onClick={() => toggle(action.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition ${
                  state === 'done'
                    ? 'cursor-pointer hover:bg-slate-50/70 rounded-xl'
                    : 'cursor-default'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    state === 'pending'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-[#f0fdfa] text-[#36c0c9]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#0d212c]">{action.title}</span>
                    {state === 'done' && action.status === 'attention' && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200 animate-in fade-in duration-300">
                        Needs attention
                      </span>
                    )}
                  </div>
                  <span
                    key={state}
                    className={`text-xs leading-relaxed animate-in fade-in duration-300 ${
                      state === 'running' ? 'text-[#0f766e]' : 'text-[#64748b]'
                    }`}
                  >
                    {state === 'done'
                      ? action.headline
                      : state === 'running'
                        ? `${action.runningText}…`
                        : action.check}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {state === 'done' && action.confidence !== undefined && (
                    <div className="hidden sm:block">
                      <ConfidenceBadge level={action.confidence} />
                    </div>
                  )}
                  {state === 'done' ? (
                    <>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white animate-in zoom-in-50 duration-300 ${
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
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </>
                  ) : state === 'running' ? (
                    <Loader2 className="w-5 h-5 text-[#36c0c9] animate-spin" aria-label="Running" />
                  ) : (
                    <span
                      className="w-6 h-6 rounded-full border border-[#e2e8f0] bg-white"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  className="px-4 pb-5 pt-1 flex flex-col gap-4 border-t border-[#f1f5f9] animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-4">
                    {action.findings.map((f) => (
                      <div
                        key={f.label}
                        className={`flex flex-col gap-0.5 ${f.value.length > 70 ? 'sm:col-span-2' : ''}`}
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
                            <ConfidenceBadge level={s.confidence} label={`Match for ${s.name}`} />
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
            </li>
          )
        })}
      </ol>
    </section>
  )
}
