'use client'

/**
 * AnalysisDrawer — Organism
 * Side drawer listing every check the agent ran for the initial assessment brief, with the
 * findings and output of each, plus a short summary.
 * Used in: PartnershipDetail
 */

import React, { useEffect } from 'react'
import { AlertTriangle, Check, FileText, X } from 'lucide-react'
import { AgentActions } from '@/components/organisms/AgentActions'
import type { AnalysisDrawerProps } from './AnalysisDrawer.types'

export const AnalysisDrawer: React.FC<AnalysisDrawerProps> = ({ request, actions, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const attention = actions.filter((a) => a.status === 'attention')

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[#0d212c]/40 backdrop-blur-xs animate-in fade-in duration-200"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-drawer-title"
        className="relative h-full w-full max-w-xl bg-white shadow-2xl border-l border-[#e2e8f0] flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#f1f5f9] shrink-0">
          <div className="flex flex-col gap-1">
            <h2 id="analysis-drawer-title" className="text-lg font-semibold text-[#0d212c]">
              AI analysis details
            </h2>
            <p className="text-xs text-[#64748b] leading-relaxed">
              These are the checks performed by the agent to generate the initial assessment brief.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI analysis"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 overscroll-contain">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#10b981] text-white flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[3]" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-[#0d212c]">
                {actions.length} checks completed
              </span>
            </div>
            {attention.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-[#0d212c]">
                  {attention.length} {attention.length === 1 ? 'risk' : 'risks'} identified
                </span>
              </div>
            )}
          </div>

          <AgentActions
            request={request}
            actions={actions}
            showHeader={false}
            showSources={false}
          />

          <div className="rounded-xl bg-[#f0f9ff] border border-[#e0f2fe] p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#0369a1] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-[#0d212c]">Summary of findings</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                {attention.length === 0
                  ? 'All checks passed. Nothing needs attention before you decide.'
                  : `All core checks ran. ${attention.length} ${
                      attention.length === 1 ? 'item needs' : 'items need'
                    } attention: ${attention.map((a) => a.title.toLowerCase()).join(', ')}.`}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
