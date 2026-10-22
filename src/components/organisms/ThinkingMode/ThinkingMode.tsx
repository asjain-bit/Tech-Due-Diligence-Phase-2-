'use client'

/**
 * ThinkingMode — Organism
 * "Agent is thinking" screen: an animated brief illustration and a check-by-check progress list
 * with a spinner on the running step. `compact` is the smaller variant used inside a page section.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { ThinkingModeProps } from './ThinkingMode.types'

export const THINKING_CHECKS = [
  'Reading vendor form details',
  'Checking for duplicate solutions',
  'Evaluating portfolio match',
  'Reviewing regulatory requirements',
  'Assessing market and competitive landscape',
]

const TEAL = '#00C4C4'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Prototype stand-in for real agent status: advances one check at a time */
const useMockAgentProgress = (total: number, stepMs: number, onComplete: () => void) => {
  const [step, setStep] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (step > total) return
    const timer = setTimeout(
      () => {
        if (step === total) onCompleteRef.current()
        setStep((s) => s + 1)
      },
      step === total ? 900 : stepMs
    )
    return () => clearTimeout(timer)
  }, [step, total, stepMs])

  return step
}

const Illustration: React.FC<{ reduced: boolean; compact: boolean }> = ({ reduced, compact }) => (
  <div
    className={`relative ${compact ? 'w-28 h-28' : 'w-40 h-40 sm:w-48 sm:h-48'}`}
    role="img"
    aria-label="An assessment brief being prepared"
  >
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <circle cx="100" cy="92" r="70" fill={TEAL} opacity="0.08">
        {!reduced && (
          <>
            <animate attributeName="r" values="64;74;64" dur="3.2s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.05;0.12;0.05"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
      <circle cx="100" cy="92" r="50" fill={TEAL} opacity="0.1" />
      <ellipse cx="100" cy="176" rx="32" ry="5" fill={TEAL} opacity="0.25" />

      <rect x="62" y="50" width="76" height="86" rx="12" fill="#ffffff" stroke="#e2e8f0" />
      <rect x="76" y="68" width="26" height="5" rx="2.5" fill={TEAL}>
        {!reduced && (
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
        )}
      </rect>
      {[84, 96, 108, 120].map((y, i) => (
        <rect
          key={y}
          x="76"
          y={y}
          width={i === 1 || i === 3 ? 32 : 48}
          height="5"
          rx="2.5"
          fill="#cbd5e1"
        >
          {!reduced && (
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="2.4s"
              begin={`${(i + 1) * 0.4}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}

      <path d="M142 42 l3.5 9 9 3.5 -9 3.5 -3.5 9 -3.5 -9 -9 -3.5 9 -3.5 z" fill={TEAL}>
        {!reduced && (
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        )}
      </path>
      <path
        d="M158 30 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z"
        fill={TEAL}
        opacity="0.7"
      />
    </svg>
  </div>
)

export const ThinkingMode: React.FC<ThinkingModeProps> = ({
  onComplete,
  stepMs = 1400,
  className = '',
  checks = THINKING_CHECKS,
  title = 'Initial Assessment Brief',
  description = 'Our AI agent is analyzing the vendor submission and running multiple checks to create the assessment brief.',
  compact = false,
  eyebrow = 'ANALYZING',
}) => {
  const total = checks.length
  const step = useMockAgentProgress(total, stepMs, onComplete)
  const finished = step >= total
  const [reduced] = useState(prefersReducedMotion)

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex items-center justify-center animate-in fade-in duration-300 ${
        compact ? 'py-6' : 'min-h-[calc(100vh-9rem)] py-8'
      } ${className}`.trim()}
    >
      <div
        className={`w-full flex flex-col items-center ${compact ? 'max-w-lg gap-5' : 'max-w-2xl gap-8'}`}
      >
        <Illustration reduced={reduced} compact={compact} />

        <div className="flex flex-col items-center gap-2 text-center px-2">
          <span className="text-xs font-semibold tracking-[0.18em]" style={{ color: TEAL }}>
            {finished ? (compact ? 'COMPLETE' : 'ANALYSIS COMPLETE') : eyebrow}
          </span>
          {compact ? (
            <h2 className="text-lg font-semibold tracking-tight text-[#0d212c]">{title}</h2>
          ) : (
            <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-[#0d212c]">
              {title}
            </h1>
          )}
          <p className="text-sm text-[#64748b] leading-relaxed max-w-lg">{description}</p>
        </div>

        <ol className="relative w-full rounded-2xl bg-white border border-[#e2e8f0] shadow-sm">
          <span
            aria-hidden="true"
            className="absolute left-[39px] top-8 bottom-8 border-l border-dashed"
            style={{ borderColor: `${TEAL}55` }}
          />
          {checks.map((label, i) => {
            const state = step > i ? 'done' : step === i ? 'active' : 'pending'
            return (
              <li
                key={label}
                data-state={state}
                className={`relative flex items-center gap-3 sm:gap-4 pl-4 sm:pl-5 pr-4 sm:pr-5 ${
                  compact ? 'min-h-14' : 'min-h-16'
                }`}
              >
                <span className="relative z-10 w-9 h-9 flex items-center justify-center shrink-0">
                  {state === 'done' ? (
                    <span className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    </span>
                  ) : state === 'active' ? (
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${TEAL}26`, color: TEAL }}
                    >
                      <Loader2
                        className={`w-4 h-4 ${reduced ? '' : 'animate-spin'}`}
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full border border-slate-300 bg-white" />
                  )}
                </span>

                <div
                  className={`flex-1 min-w-0 flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                    i > 0 ? 'border-t border-[#f1f5f9]' : ''
                  }`}
                >
                  <span
                    className={`text-sm ${state === 'pending' ? 'text-[#64748b]' : 'text-[#0d212c]'}`}
                  >
                    {label}
                  </span>

                  {state === 'done' && (
                    <span className="text-sm font-medium text-[#16a34a] shrink-0">Completed</span>
                  )}
                  {state === 'active' && (
                    <span className="flex flex-wrap items-center gap-x-2 text-sm text-[#64748b] sm:shrink-0">
                      Analyzing...
                      <span className="flex items-center gap-1" aria-hidden="true">
                        {[0, 1, 2].map((n) => (
                          <span
                            key={n}
                            className={`w-1.5 h-1.5 rounded-full ${reduced ? '' : 'animate-pulse'}`}
                            style={{ backgroundColor: TEAL, animationDelay: `${n * 200}ms` }}
                          />
                        ))}
                      </span>
                    </span>
                  )}
                  {state === 'pending' && (
                    <span className="text-sm text-[#94a3b8] shrink-0">Pending</span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
