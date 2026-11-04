'use client'

/**
 * AuditLog — Organism
 * Timeline of everything that has happened on a case, newest first. Each entry is colour
 * coded by what kind of event it is, with a legend for the four colours.
 * Used in: PartnershipDetail
 */

import React from 'react'
import { AlertTriangle, CheckCircle2, Clock, Sparkles, User } from 'lucide-react'
import type { AuditKind } from '@/types/partnership.types'
import type { AuditKindStyles, AuditLogProps } from './AuditLog.types'

/** The colour code used for audit entries across the app */
export const AUDIT_KIND_STYLES: AuditKindStyles = {
  critical: {
    label: 'Critical / Risk',
    dot: 'bg-red-500',
    badge: 'bg-red-50 border-red-200 text-red-500',
  },
  agent: {
    label: 'Agent Action',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 border-amber-200 text-amber-500',
  },
  approval: {
    label: 'Approval / Sign-off',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 border-emerald-200 text-emerald-500',
  },
  user: {
    label: 'User Action',
    dot: 'bg-[#36c0c9]',
    badge: 'bg-[#e6fffa] border-[#ccfbf1] text-[#36c0c9]',
  },
}

const ICONS: Record<AuditKind, React.ComponentType<{ className?: string }>> = {
  critical: AlertTriangle,
  agent: Sparkles,
  approval: CheckCircle2,
  user: User,
}

export const AuditLog: React.FC<AuditLogProps> = ({ events, className = '' }) => {
  const ordered = [...events].reverse()

  return (
    <section
      aria-labelledby="audit-log-heading"
      className={`flex flex-col gap-6 ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 id="audit-log-heading" className="text-xl font-semibold text-[#0d212c]">
          Audit Log
        </h2>
        <ul aria-label="Colour legend" className="flex items-center gap-2 flex-wrap">
          {(Object.keys(AUDIT_KIND_STYLES) as AuditKind[]).map((kind) => (
            <li
              key={kind}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-medium text-[#475569]"
            >
              <span
                className={`w-2 h-2 rounded-full ${AUDIT_KIND_STYLES[kind].dot}`}
                aria-hidden="true"
              />
              {AUDIT_KIND_STYLES[kind].label}
            </li>
          ))}
        </ul>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-[#64748b] py-8 text-center">No activity has been logged yet.</p>
      ) : (
        <ol className="flex flex-col">
          {ordered.map((event, i) => {
            const style = AUDIT_KIND_STYLES[event.kind]
            const Icon = ICONS[event.kind]
            const isLast = i === ordered.length - 1
            return (
              <li key={event.id} data-kind={event.kind} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`w-10 h-10 rounded-full border flex items-center justify-center ${style.badge}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  {!isLast && (
                    <span className="w-px flex-1 bg-[#e2e8f0] my-1.5" aria-hidden="true" />
                  )}
                </div>

                <div
                  className={`flex-1 min-w-0 flex items-start justify-between gap-4 flex-wrap ${isLast ? '' : 'pb-6'}`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#0d212c]">{event.title}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{event.description}</p>
                    <p className="text-xs text-[#64748b] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                      Actor: <span className="font-semibold text-[#0d212c]">{event.actor}</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b] whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {event.timestamp}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
