'use client'

/**
 * ThinkingMode — Organism
 * Full-width "agent is thinking" screen shown while the Initial Assessment Brief is prepared:
 * an animated vector of information flowing into the brief, and a five-check progress list.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useRef, useState } from 'react'
import { BarChart3, Check, Database, FileText, ShieldCheck } from 'lucide-react'
import type { ThinkingModeProps } from './ThinkingMode.types'

export const THINKING_CHECKS = [
  'Reading vendor form details',
  'Checking for duplicate solutions',
  'Evaluating portfolio match',
  'Reviewing regulatory requirements',
  'Assessing market and competitive landscape',
]

const TEAL = '#00C4C4'

/** Curved connectors from each icon tile to the central document */
const PATHS = [
  'M84 54 C 140 54, 150 80, 215 80',
  'M84 136 C 140 136, 150 110, 215 110',
  'M436 54 C 380 54, 370 80, 305 80',
  'M436 136 C 380 136, 370 110, 305 110',
]

const TILES = [
  { Icon: FileText, left: '5.4%', top: '13.7%', label: 'Vendor submission' },
  { Icon: BarChart3, left: '5.4%', top: '56.8%', label: 'Market analysis' },
  { Icon: Database, left: '83.8%', top: '13.7%', label: 'Portfolio' },
  { Icon: ShieldCheck, left: '83.8%', top: '56.8%', label: 'Compliance' },
]

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

const Illustration: React.FC<{ reduced: boolean }> = ({ reduced }) => (
  <div
    className="relative w-full max-w-[520px] aspect-[520/190]"
    role="img"
    aria-label="Information from the vendor submission, portfolio, market and compliance flowing into the assessment brief"
  >
    <svg viewBox="0 0 520 190" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {/* Halo */}
      <circle cx="260" cy="95" r="66" fill={TEAL} opacity="0.08">
        {!reduced && (
          <>
            <animate attributeName="r" values="60;70;60" dur="3.2s" repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.05;0.12;0.05"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>

      {/* Connectors */}
      {PATHS.map((d) => (
        <path key={d} d={d} fill="none" stroke={TEAL} strokeOpacity="0.35" strokeWidth="1.2" />
      ))}

      {/* Information flowing along the connectors */}
      {!reduced &&
        PATHS.flatMap((d, i) =>
          [0, 1].map((n) => (
            <circle key={`${d}-${n}`} r="3" fill={TEAL}>
              <animateMotion
                dur="2.8s"
                begin={`${i * 0.35 + n * 1.4}s`}
                repeatCount="indefinite"
                path={d}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.15;0.85;1"
                dur="2.8s"
                begin={`${i * 0.35 + n * 1.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))
        )}

      {/* Central document */}
      <rect x="215" y="40" width="90" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" />
      <rect x="231" y="62" width="34" height="5" rx="2.5" fill={TEAL}>
        {!reduced && (
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
        )}
      </rect>
      {[82, 96, 110, 124].map((y, i) => (
        <rect key={y} x="231" y={y} width={i === 3 ? 38 : 58} height="5" rx="2.5" fill="#cbd5e1">
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

      {/* Sparkle */}
      <path d="M306 34 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill={TEAL}>
        {!reduced && (
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        )}
      </path>
      <path
        d="M322 24 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z"
        fill={TEAL}
        opacity="0.7"
      />
    </svg>

    {TILES.map(({ Icon, left, top, label }) => (
      <div
        key={label}
        title={label}
        style={{ left, top, width: '10.8%' }}
        className="absolute aspect-square rounded-2xl bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#475569]"
      >
        <Icon className="w-1/2 h-1/2" strokeWidth={1.8} />
      </div>
    ))}
  </div>
)

export const ThinkingMode: React.FC<ThinkingModeProps> = ({
  onComplete,
  stepMs = 1400,
  className = '',
}) => {
  const total = THINKING_CHECKS.length
  const step = useMockAgentProgress(total, stepMs, onComplete)
  const finished = step >= total
  const [reduced] = useState(prefersReducedMotion)

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full min-h-[calc(100vh-9rem)] flex items-center justify-center py-8 animate-in fade-in duration-300 ${className}`.trim()}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <Illustration reduced={reduced} />

        <div className="flex flex-col items-center gap-2 text-center px-2">
          <span className="text-xs font-semibold tracking-[0.18em]" style={{ color: TEAL }}>
            {finished ? 'ANALYSIS COMPLETE' : 'ANALYZING'}
          </span>
          <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-[#0d212c]">
            Initial Assessment Brief
          </h1>
          <p className="text-sm text-[#64748b] leading-relaxed max-w-lg">
            Our AI agent is analyzing the vendor submission and running multiple checks to create
            the assessment brief.
          </p>
        </div>

        <ol className="relative w-full rounded-2xl bg-white border border-[#e2e8f0] shadow-sm">
          <span
            aria-hidden="true"
            className="absolute left-[39px] top-8 bottom-8 border-l border-dashed"
            style={{ borderColor: `${TEAL}55` }}
          />
          {THINKING_CHECKS.map((label, i) => {
            const state = step > i ? 'done' : step === i ? 'active' : 'pending'
            return (
              <li
                key={label}
                data-state={state}
                className={`relative flex items-center gap-3 sm:gap-4 px-4 sm:px-5 min-h-16 py-3 ${
                  i > 0 ? 'border-t border-[#f1f5f9]' : ''
                }`}
              >
                <span className="relative z-10 w-9 h-9 flex items-center justify-center shrink-0">
                  {state === 'done' ? (
                    <span className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                    </span>
                  ) : state === 'active' ? (
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        reduced ? '' : 'animate-pulse'
                      }`}
                      style={{ backgroundColor: `${TEAL}26`, color: TEAL }}
                    >
                      <FileText className="w-4 h-4" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full border border-slate-300 bg-white" />
                  )}
                </span>

                <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
