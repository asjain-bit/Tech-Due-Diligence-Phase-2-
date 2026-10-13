'use client'

import React, { useState } from 'react'
import { Layers, Clock, FileSignature, GitFork, Inbox } from 'lucide-react'
import { SearchBar } from '@/components/molecules/SearchBar'
import { StatusChip } from '@/components/atoms/StatusChip'
import { PartnershipDetail } from '@/components/organisms/PartnershipDetail'
import { type PartnershipRequest, INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

export const DashboardScreen: React.FC = () => {
  const [requests, setRequests] = useState<PartnershipRequest[]>(INITIAL_PARTNERSHIP_REQUESTS)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Status categories for StatusChip (Pending, In Progress, At Risk, Exited)
  const getStatusCategory = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'info'
      case 'Pending':
        return 'warning'
      case 'At Risk':
        return 'error'
      case 'Exited':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  // Handle proceed from detailed view
  const handleProceed = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r
        const updatedStages = r.workflowStages.map((stage) => {
          if (stage.id === 3)
            return { ...stage, status: 'completed' as const, subheading: 'Completed' }
          if (stage.id === 4)
            return { ...stage, status: 'in_progress' as const, subheading: 'In Progress' }
          return stage
        })
        return {
          ...r,
          status: 'In Progress' as const,
          workflowStages: updatedStages,
          decision: {
            status: 'proceeded',
            reason: reason || 'Approved to proceed to next stage.',
            date: 'Just now',
          },
        }
      })
    )

    setSelectedRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev
      const updatedStages = prev.workflowStages.map((stage) => {
        if (stage.id === 3)
          return { ...stage, status: 'completed' as const, subheading: 'Completed' }
        if (stage.id === 4)
          return { ...stage, status: 'in_progress' as const, subheading: 'In Progress' }
        return stage
      })
      return {
        ...prev,
        status: 'In Progress' as const,
        workflowStages: updatedStages,
        decision: {
          status: 'proceeded',
          reason: reason || 'Approved to proceed to next stage.',
          date: 'Just now',
        },
      }
    })

    setToastMessage('Partnership request has been approved to proceed to the next stage.')
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Handle reject from detailed view
  const handleReject = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r
        return {
          ...r,
          status: 'Exited' as const,
          decision: {
            status: 'rejected',
            reason,
            date: 'Just now',
          },
        }
      })
    )

    setSelectedRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev
      return {
        ...prev,
        status: 'Exited' as const,
        decision: {
          status: 'rejected',
          reason,
          date: 'Just now',
        },
      }
    })

    setToastMessage('Partnership request has been rejected.')
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesFilter =
      selectedStatusFilter === 'all' ||
      req.status.toLowerCase() === selectedStatusFilter.toLowerCase()

    if (!matchesFilter) return false

    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      req.companyName.toLowerCase().includes(q) ||
      req.vendorName.toLowerCase().includes(q) ||
      req.solution.toLowerCase().includes(q) ||
      req.focusArea.toLowerCase().includes(q) ||
      req.solutionMaturity.toLowerCase().includes(q)
    )
  })

  // Filter options with dynamic counts (Pending, In progress, At Risk, Exited)
  const filterOptions = [
    { key: 'all', label: 'All requests', count: requests.length },
    {
      key: 'pending',
      label: 'Pending',
      count: requests.filter((r) => r.status === 'Pending').length,
    },
    {
      key: 'in progress',
      label: 'In Progress',
      count: requests.filter((r) => r.status === 'In Progress').length,
    },
    {
      key: 'at risk',
      label: 'At Risk',
      count: requests.filter((r) => r.status === 'At Risk').length,
    },
    {
      key: 'exited',
      label: 'Exited',
      count: requests.filter((r) => r.status === 'Exited').length,
    },
  ]

  // Detailed view rendering
  if (selectedRequest) {
    return (
      <div className="flex flex-col gap-6 w-full px-3 py-3 text-[#0d212c]">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-white border border-[#e2e8f0] text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span>{toastMessage}</span>
          </div>
        )}
        <PartnershipDetail
          request={selectedRequest}
          onBack={() => setSelectedRequest(null)}
          onProceed={handleProceed}
          onReject={handleReject}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full px-6 lg:px-10 py-3 text-[#0d212c]">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-white border border-[#e2e8f0] text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 KPI Cards — Icons without background per specification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI Card 1: Total Partnership Requests */}
        <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.06em]">
              Total Partnership Requests
            </span>
            <div className="flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-[#0284c7] stroke-[2]" />
            </div>
          </div>
          <div className="text-4xl font-semibold text-[#0d212c] leading-none my-1">24</div>
          <div className="h-[1px] bg-slate-100 w-full" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#16a34a]">
            <span>+1 this month ↗</span>
          </div>
        </div>

        {/* KPI Card 2: Pending Director Review */}
        <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.06em]">
              Pending Director Review
            </span>
            <div className="flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#d97706] stroke-[2]" />
            </div>
          </div>
          <div className="text-4xl font-semibold text-[#0d212c] leading-none my-1">8</div>
          <div className="h-[1px] bg-slate-100 w-full" />
          <div className="text-xs font-medium text-[#64748b]">Require PMO action</div>
        </div>

        {/* KPI Card 3: NDA in Progress */}
        <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.06em]">
              NDA in Progress
            </span>
            <div className="flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-[#6366f1] stroke-[2]" />
            </div>
          </div>
          <div className="text-4xl font-semibold text-[#0d212c] leading-none my-1">6</div>
          <div className="h-[1px] bg-slate-100 w-full" />
          <div className="text-xs font-medium text-[#64748b]">Needs monitoring</div>
        </div>

        {/* KPI Card 4: EXITED BEFORE DIRECTOR REVIEW */}
        <div className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.06em]">
              EXITED BEFORE DIRECTOR REVIEW
            </span>
            <div className="flex items-center justify-center shrink-0">
              <GitFork className="w-5 h-5 text-[#ef4444] stroke-[2]" />
            </div>
          </div>
          <div className="text-4xl font-semibold text-[#0d212c] leading-none my-1">12</div>
          <div className="h-[1px] bg-slate-100 w-full" />
          <div className="text-xs font-medium text-[#64748b]">
            Filtered out during initial agent screening
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="pt-2">
        <h2 className="text-xl font-extrabold text-[#0d212c]">Partnership Requests</h2>
      </div>

      {/* Filter Status Chips on the left & Search Bar on the right without search button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="w-full sm:w-72 shrink-0">
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Search partnership requests..."
            showButton={false}
          />
        </div>
      </div>

      {/* Partnership Requests Table — Referred by column removed from table per instruction */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden w-full flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Column titles: font size text-[11px], font weight font-semibold */}
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-4 px-4">Company name</th>
                <th className="py-4 px-4">Vendor Name</th>
                <th className="py-4 px-4">Solution</th>
                <th className="py-4 px-4">Focus Area</th>
                <th className="py-4 px-4">Solution Maturity</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#64748b]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Inbox className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-semibold text-xs text-[#0d212c]">
                        No partnership requests found
                      </h4>
                      <p className="text-xs text-[#64748b] leading-relaxed">
                        No requests match your current search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Increased row height via py-4.5 padding */}
                    <td className="py-4.5 px-4 text-xs font-medium text-[#0d212c] group-hover:text-[#36c0c9]">
                      {req.companyName}
                    </td>

                    {/* Vendor Name */}
                    <td className="py-4.5 px-4 text-xs font-normal text-[#0d212c]">
                      {req.vendorName}
                    </td>

                    <td className="py-4.5 px-4 text-xs font-normal text-[#0d212c] max-w-xs truncate">
                      {req.solution}
                    </td>

                    <td className="py-4.5 px-4 text-xs font-normal text-[#64748b]">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {(req.assessmentAreas?.focusAreas &&
                        req.assessmentAreas.focusAreas.length > 0
                          ? req.assessmentAreas.focusAreas
                          : req.tags && req.tags.length > 0
                            ? req.tags
                            : [req.focusArea]
                        ).map((area, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-normal whitespace-nowrap"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4.5 px-4 text-xs font-normal text-[#64748b]">
                      {req.solutionMaturity}
                    </td>

                    {/* Chip without dot per requirement */}
                    <td className="py-4.5 px-4 text-xs font-normal">
                      <StatusChip
                        label={req.status}
                        status={getStatusCategory(req.status)}
                        dot={false}
                      />
                    </td>

                    <td className="py-4.5 px-4 text-xs font-normal text-[#64748b] whitespace-nowrap">
                      {req.deadline || req.submittedOn}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
