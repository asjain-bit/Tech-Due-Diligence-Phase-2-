'use client'

import React, { useState } from 'react'
import { Users, RefreshCw, Folder, Info, Inbox } from 'lucide-react'
import { SearchBar } from '@/components/molecules/SearchBar'

export interface AssessmentRow {
  id: string
  vendor: string
  questionnaire: string
  round: string
  status: 'awaiting_evidence' | 'completed' | 'scheduled' | 'finalised' | 'ready'
  score: string
  createdDate: string
}

export const DashboardScreen: React.FC = () => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Empty assessments table as requested: "keep the table empty as of now."
  const assessments: AssessmentRow[] = []

  // Filter options with zero counts reflecting the empty table state
  const filterOptions = [
    { key: 'all', label: 'All assessments', count: 0 },
    { key: 'awaiting_evidence', label: 'Awaiting evidence', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'finalised', label: 'Finalised', count: 0 },
    { key: 'scheduled', label: 'Scheduled', count: 0 },
  ]

  return (
    <div className="flex flex-col gap-6 w-full px-6 lg:px-10 py-6 text-[#0d212c]">
      {/* Breadcrumb Menu */}
      <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1.5">
        <span>M42 admin</span>
        <span>/</span>
        <span className="text-[#36c0c9] font-bold">Dashboard</span>
      </div>

      {/* KPI Cards — Exact same 3 cards design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* KPI Card 1: Total Vendors */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Users className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Total Vendors
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">0</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">High confidence</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">Medium confidence</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">Low confidence</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Breakdown by Overall Assessment Score</span>
          </div>
        </div>

        {/* KPI Card 2: Average Rounds per Vendor */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <RefreshCw className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Average Rounds per Vendor
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">0</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">1 Round</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">2 Rounds</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">3+ Rounds</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Breakdown by Assessment Rounds</span>
          </div>
        </div>

        {/* KPI Card 3: Evidence backlog by age */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Folder className="w-5 h-5 text-[#0d212c] shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0d212c] truncate">
                Evidence backlog by age
              </h3>
            </div>
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">0</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">0–14 days</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">15–30 days</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">0</span>
              <span className="text-[11px] text-[#64748b] font-medium">Over 30 days</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#64748b]">
            <Info className="w-3.5 h-3.5 text-[#36c0c9] shrink-0" />
            <span>Breakdown by Ageing Bucket for Awaiting Evidence status</span>
          </div>
        </div>
      </div>

      {/* Assessments Title & Search Bar Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <h2 className="text-xl font-extrabold text-[#0d212c]">Assessments</h2>
        <div className="w-full sm:w-80 shrink-0">
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Filter records..."
          />
        </div>
      </div>

      {/* Filter Status Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((chip) => {
          const isSelected = selectedStatusFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => setSelectedStatusFilter(chip.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#36c0c9] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[#f1f5f9] text-[#64748b]'
                }`}
              >
                {chip.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Vendor Assessments Directory Table — Empty Table State */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden w-full flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold">
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Questionnaire</th>
                <th className="py-3.5 px-4">Round</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Confidence Level</th>
                <th className="py-3.5 px-4">Created date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#64748b]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Inbox className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-bold text-sm text-[#0d212c]">No assessments available</h4>
                      <p className="text-xs text-[#64748b] leading-relaxed">
                        There are currently no vendor assessments in this view. Newly initiated
                        assessments and assigned questionnaires will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
