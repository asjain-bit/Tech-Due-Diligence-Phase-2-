'use client'

import React, { useState } from 'react'
import { Users, RefreshCw, Folder, Info, Inbox } from 'lucide-react'
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

  // Status categories for StatusChip
  const getStatusCategory = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'New':
        return 'info'
      case 'Rejected':
        return 'error'
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
            return { ...stage, status: 'completed' as const, subheading: 'Completed' as const }
          if (stage.id === 4)
            return { ...stage, status: 'in_progress' as const, subheading: 'In Progress' as const }
          return stage
        })
        return {
          ...r,
          status: 'Shortlisted' as const,
          workflowStages: updatedStages,
          decision: {
            status: 'proceeded',
            reason: reason || 'Approved to proceed to NDA & Discovery stage.',
            date: 'Just now',
          },
        }
      })
    )

    // Update selected request in detailed view if open
    setSelectedRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev
      const updatedStages = prev.workflowStages.map((stage) => {
        if (stage.id === 3)
          return { ...stage, status: 'completed' as const, subheading: 'Completed' as const }
        if (stage.id === 4)
          return { ...stage, status: 'in_progress' as const, subheading: 'In Progress' as const }
        return stage
      })
      return {
        ...prev,
        status: 'Shortlisted' as const,
        workflowStages: updatedStages,
        decision: {
          status: 'proceeded',
          reason: reason || 'Approved to proceed to NDA & Discovery stage.',
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
          status: 'Rejected' as const,
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
        status: 'Rejected' as const,
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

  // Filter options with dynamic counts
  const filterOptions = [
    { key: 'all', label: 'All requests', count: requests.length },
    {
      key: 'shortlisted',
      label: 'Shortlisted',
      count: requests.filter((r) => r.status === 'Shortlisted').length,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: requests.filter((r) => r.status === 'Pending').length,
    },
    {
      key: 'new',
      label: 'New',
      count: requests.filter((r) => r.status === 'New').length,
    },
  ]

  // If a row is clicked, render detailed view
  if (selectedRequest) {
    return (
      <div className="flex flex-col gap-6 w-full px-6 lg:px-10 py-6 text-[#0d212c]">
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
    <div className="flex flex-col gap-6 w-full px-6 lg:px-10 py-6 text-[#0d212c]">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-white border border-[#e2e8f0] text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">{requests.length}</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">
                {requests.filter((r) => r.status === 'Shortlisted').length}
              </span>
              <span className="text-[11px] text-[#64748b] font-medium">High confidence</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">
                {requests.filter((r) => r.status === 'Pending').length}
              </span>
              <span className="text-[11px] text-[#64748b] font-medium">Medium confidence</span>
            </div>
            <div className="flex flex-col gap-0.5 pl-3">
              <span className="text-lg font-bold text-[#0d212c]">
                {requests.filter((r) => r.status === 'New').length}
              </span>
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
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">1.8</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">2</span>
              <span className="text-[11px] text-[#64748b] font-medium">1 Round</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">2</span>
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
            <div className="text-2xl font-extrabold text-[#36c0c9] shrink-0">2</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] pt-3 border-t border-[#e2e8f0]">
            <div className="flex flex-col gap-0.5 pr-2">
              <span className="text-lg font-bold text-[#0d212c]">1</span>
              <span className="text-[11px] text-[#64748b] font-medium">0–14 days</span>
            </div>
            <div className="flex flex-col gap-0.5 px-3">
              <span className="text-lg font-bold text-[#0d212c]">1</span>
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

      {/* Title & Search Bar Row — Renamed to "Partnership Requests" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <h2 className="text-xl font-extrabold text-[#0d212c]">Partnership Requests</h2>
        <div className="w-full sm:w-80 shrink-0">
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Filter records..."
          />
        </div>
      </div>

      {/* Filter Status Chips Row — Shortlisted, Pending, New */}
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

      {/* Partnership Requests Table — Only requested columns */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden w-full flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Company name</th>
                <th className="py-3.5 px-4">Vendor Name</th>
                <th className="py-3.5 px-4">Solution</th>
                <th className="py-3.5 px-4">Focus Area</th>
                <th className="py-3.5 px-4">Solution Maturity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted on</th>
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
                      <h4 className="font-bold text-sm text-[#0d212c]">
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
                    <td className="py-3.5 px-4 font-bold text-[#0d212c] group-hover:text-[#0f766e]">
                      {req.companyName}
                    </td>
                    <td className="py-3.5 px-4 text-[#0d212c] font-medium">{req.vendorName}</td>
                    <td className="py-3.5 px-4 text-[#0d212c] max-w-xs truncate">{req.solution}</td>
                    <td className="py-3.5 px-4 text-[#64748b]">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        {req.focusArea}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748b]">{req.solutionMaturity}</td>
                    <td className="py-3.5 px-4">
                      <StatusChip label={req.status} status={getStatusCategory(req.status)} dot />
                    </td>
                    <td className="py-3.5 px-4 text-[#64748b] text-xs">{req.submittedOn}</td>
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
