'use client'

/**
 * ReviewersLoading — Molecule
 * Short animated state shown while the agent finds and maps the Internal Interest and
 * Strategy reviewers, before the Internal Review step appears.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import type { ReviewersLoadingProps } from './ReviewersLoading.types'

const LINE_MS = 1000

export const ReviewersLoading: React.FC<ReviewersLoadingProps> = ({
  internalCount,
  strategyCount,
  onComplete,
  className = '',
}) => {
  const lines = [
    { running: 'Finding the Internal Interest team', done: `${internalCount} reviewers found` },
    { running: 'Finding the Strategy team', done: `${strategyCount} reviewer found` },
    { running: 'Mapping reviewers to this request', done: 'Matched on KPI and expertise' },
  ]
  const [step, setStep] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (step > lines.length) return
    const timer = setTimeout(
      () => {
        if (step === lines.length) onCompleteRef.current()
        setStep((s) => s + 1)
      },
      step === lines.length ? 500 : LINE_MS
    )
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-8 py-16 animate-in fade-in duration-300 ${className}`.trim()}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-[#36c0c9]/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-2xl bg-[#e6fffa] text-[#36c0c9] border border-[#ccfbf1] flex items-center justify-center">
          <Sparkles className="w-7 h-7" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-base font-semibold text-[#0d212c]">Finding reviewers</h2>
        <p className="text-xs text-[#64748b]">
          The agent is choosing who should review this request
        </p>
      </div>

      <ul className="w-full max-w-sm flex flex-col gap-3">
        {lines.map((line, i) => {
          const state = step > i ? 'done' : step === i ? 'running' : 'pending'
          return (
            <li
              key={line.running}
              data-state={state}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                state === 'running' ? 'border-[#36c0c9] bg-[#f0fdfa]' : 'border-[#e2e8f0] bg-white'
              } ${state === 'pending' ? 'opacity-40' : ''}`}
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                {state === 'done' ? (
                  <Check
                    className="w-4 h-4 text-[#10b981] stroke-[3] animate-in zoom-in-50 duration-300"
                    aria-hidden="true"
                  />
                ) : state === 'running' ? (
                  <Loader2 className="w-4 h-4 text-[#36c0c9] animate-spin" aria-hidden="true" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" aria-hidden="true" />
                )}
              </span>
              <span key={state} className="text-sm text-[#0d212c] animate-in fade-in duration-300">
                {state === 'done'
                  ? line.done
                  : state === 'running'
                    ? `${line.running}…`
                    : line.running}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
