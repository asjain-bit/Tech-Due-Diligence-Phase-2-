'use client'

/**
 * ThinkingMode — Organism
 * Simple "agent is working" state: an animated brief illustration, a short description and one
 * line of progress text that moves on every moment, like "Reading vendor form details".
 * `inline` sits inside a page section instead of taking the whole page.
 * Used in: PartnershipDetail, ReviewersLoading
 */

import React, { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
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

/** Prototype stand-in for real agent status: moves to the next message on a timer */
const useMockAgentProgress = (total: number, stepMs: number, onComplete: () => void) => {
  const [step, setStep] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (step >= total) return
    const timer = setTimeout(() => {
      if (step === total - 1) onCompleteRef.current()
      setStep((s) => s + 1)
    }, stepMs)
    return () => clearTimeout(timer)
  }, [step, total, stepMs])

  return step
}

const Illustration: React.FC<{ reduced: boolean; inline: boolean }> = ({ reduced, inline }) => (
  <div
    className={`relative ${inline ? 'w-28 h-28' : 'w-40 h-40 sm:w-48 sm:h-48'}`}
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
  messages = THINKING_CHECKS,
  title,
  description = 'Our AI agent is analyzing the vendor submission and running multiple checks to create the assessment brief.',
  inline = false,
  eyebrow = 'ANALYZING',
}) => {
  const step = useMockAgentProgress(messages.length, stepMs, onComplete)
  const [reduced] = useState(prefersReducedMotion)
  const message = messages[Math.min(step, messages.length - 1)]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full flex items-center justify-center animate-in fade-in duration-300 ${
        inline ? 'py-12' : 'min-h-[calc(100vh-9rem)] py-8'
      } ${className}`.trim()}
    >
      <div className="w-full max-w-xl flex flex-col items-center gap-6">
        <Illustration reduced={reduced} inline={inline} />

        <div className="flex flex-col items-center gap-2 text-center px-2">
          <span className="text-xs font-semibold tracking-[0.18em]" style={{ color: TEAL }}>
            {eyebrow}
          </span>
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-[#0d212c]">{title}</h2>
          )}
          <p className="text-sm text-[#64748b] leading-relaxed max-w-lg">{description}</p>
        </div>

        <p className="flex items-center gap-2 text-sm text-[#475569] min-h-5">
          <Loader2
            className={`w-4 h-4 shrink-0 ${reduced ? '' : 'animate-spin'}`}
            style={{ color: TEAL }}
            aria-hidden="true"
          />
          <span key={message} className="animate-in fade-in duration-300">
            {message}…
          </span>
        </p>
      </div>
    </div>
  )
}
