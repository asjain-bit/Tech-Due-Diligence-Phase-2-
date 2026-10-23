'use client'

import React, { useState } from 'react'
import {
  Layers,
  Clock,
  FileSignature,
  GitFork,
  Inbox,
  ClipboardList,
  CheckCircle2,
  Briefcase,
} from 'lucide-react'
import { SearchBar } from '@/components/molecules/SearchBar'
import { StatusChip } from '@/components/atoms/StatusChip'
import { PartnershipDetail } from '@/components/organisms/PartnershipDetail'
import {
  type PartnershipRequest,
  type SlaStatus,
  INITIAL_PARTNERSHIP_REQUESTS,
} from '@/types/partnership.types'
import {
  appendAudit,
  applyCaseAction,
  getStageLabel,
  holdRequest,
  proceedRequest,
  rejectRequest,
  resumeRequest,
  routeRequest,
  sendReview,
  submitReview,
  type AdminRouting,
  type AuditInput,
  type CaseAction,
} from '@/lib/caseActions'
import {
  adminKpis,
  directorKpis,
  internalInterestKpis,
  sponsorKpis,
  strategyLeadKpis,
} from '@/lib/roleKpis'
import { type UserProfile } from './LoginScreen'

export interface DashboardScreenProps {
  userProfile?: UserProfile
  /** Shared cases. When omitted the screen keeps its own copy of the seed data. */
  requests?: PartnershipRequest[]
  onRequestsChange?: React.Dispatch<React.SetStateAction<PartnershipRequest[]>>
}

/** Prototype stand-in for the Strategy Team's answer once a request is sent to them */
const SIMULATED_STRATEGY_RESPONSE = {
  documents: ['M42_Roadmap_Register.xlsx', 'News_Trends_Agent_KB_Extract.docx'],
  finalDecision: 'Proceed' as const,
  finalDecisionNote:
    'Proceed on the condition that the vendor commits to UAE data hosting and registers a local entity.',
  submittedAt: 'Just now',
}

const CASE_ACTION_TOASTS: Partial<Record<CaseAction['type'], string>> = {
  closeCase: 'The case has been closed.',
  assignSponsors: 'Sponsors assigned. Strategic Alignment is next.',
  uploadNda: 'Signed NDA uploaded. The alignment pack has been generated.',
  proceedToValue: 'Moved on to Value & Due Diligence.',
  confirmValueCall: 'Value assessment call confirmed.',
  businessCase: 'Business case uploaded.',
  valueDecision: 'Your decision has been recorded.',
  uploadTddReport: 'The TDD report has been uploaded.',
}

const SLA_TEXT_COLOR: Record<SlaStatus, string> = {
  'On track': 'text-[#16a34a]',
  'At risk': 'text-[#d97706]',
  Breached: 'text-[#dc2626]',
}

/** At Risk is not a status in the table: those cases are simply in progress */
const tableStatus = (status: PartnershipRequest['status']) =>
  status === 'At Risk' ? 'In Progress' : status

/** Two lines of the solution description, with the full text in a tooltip */
const DescriptionCell: React.FC<{ text: string }> = ({ text }) => {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setPos({ left: Math.min(r.left, window.innerWidth - 320), top: r.bottom + 6 })
  }
  return (
    <>
      <p
        tabIndex={0}
        aria-label={text}
        onMouseEnter={(e) => show(e.currentTarget)}
        onMouseLeave={() => setPos(null)}
        onFocus={(e) => show(e.currentTarget)}
        onBlur={() => setPos(null)}
        className="text-xs font-normal text-[#0d212c] leading-relaxed line-clamp-2 max-w-[260px] outline-none"
      >
        {text}
      </p>
      {pos && (
        <div
          role="tooltip"
          style={{ left: pos.left, top: pos.top }}
          className="fixed z-50 w-80 bg-[#0d212c] text-white text-[11px] font-medium leading-relaxed px-3 py-2 rounded-xl shadow-xl pointer-events-none animate-in fade-in duration-150"
        >
          {text}
        </div>
      )}
    </>
  )
}

/** Icons of the four role KPI cards, in order */
const KPI_ICONS_OPERATIONS = [
  <Layers key="a" className="w-5 h-5 text-[#0284c7] stroke-[2]" />,
  <Clock key="b" className="w-5 h-5 text-[#d97706] stroke-[2]" />,
  <FileSignature key="c" className="w-5 h-5 text-[#6366f1] stroke-[2]" />,
  <GitFork key="d" className="w-5 h-5 text-[#ef4444] stroke-[2]" />,
]
const KPI_ICONS = [
  <Briefcase key="a" className="w-5 h-5 text-[#0284c7] stroke-[2]" />,
  <ClipboardList key="b" className="w-5 h-5 text-[#d97706] stroke-[2]" />,
  <CheckCircle2 key="c" className="w-5 h-5 text-[#16a34a] stroke-[2]" />,
  <GitFork key="d" className="w-5 h-5 text-[#ef4444] stroke-[2]" />,
]

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userProfile,
  requests: sharedRequests,
  onRequestsChange,
}) => {
  const isInternalTeam =
    userProfile?.id === 'evaluator' || userProfile?.roleTitle === 'Internal Interest Team'
  const isStrategyTeam =
    userProfile?.id === 'strategy-fit' || userProfile?.roleTitle === 'Strategy Team'
  const isNonDirector = isInternalTeam || isStrategyTeam
  const isAdmin = userProfile?.id === 'partnership-admin'
  const isSponsor = userProfile?.id === 'sponsor' || userProfile?.roleTitle === 'Sponsor'
  const [localRequests, setLocalRequests] = useState<PartnershipRequest[]>(
    INITIAL_PARTNERSHIP_REQUESTS
  )
  const requests = sharedRequests ?? localRequests
  const setRequests = onRequestsChange ?? setLocalRequests
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedRequest = requests.find((r) => r.id === selectedId) ?? null
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
      case 'Closed':
        return 'neutral'
      case 'Information Requested':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const notify = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const updateRequest = (requestId: string, fn: (r: PartnershipRequest) => PartnershipRequest) =>
    setRequests((prev) => prev.map((r) => (r.id === requestId ? fn(r) : r)))

  // Director approves the brief
  const handleProceed = (requestId: string, reason: string) => {
    updateRequest(requestId, (r) => proceedRequest(r, reason))
    notify('Partnership request has been approved to proceed to the next stage.')
  }

  // Director rejects the request
  const handleReject = (requestId: string, reason: string) => {
    updateRequest(requestId, (r) => rejectRequest(r, reason))
    notify('Partnership request has been rejected.')
  }

  // Director asks the vendor for more information
  const handleRequestInfo = (
    requestId: string,
    email: { to: string; subject: string; body: string }
  ) => {
    updateRequest(requestId, (r) => holdRequest(r, email))
    notify(
      'Information request sent. The case is marked Information Requested until the vendor replies.'
    )
  }

  const handleResume = (requestId: string) => {
    updateRequest(requestId, resumeRequest)
    notify('Vendor information received. The case is back with the Director.')
  }

  // Something worth recording happened in the case view
  const handleLog = (requestId: string, event: AuditInput) =>
    updateRequest(requestId, (r) => appendAudit(r, event))

  // Director sends a review request to a team
  const handleSendReview: React.ComponentProps<typeof PartnershipDetail>['onSendReview'] = (
    requestId,
    team,
    payload
  ) => {
    updateRequest(requestId, (r) => {
      const sent = sendReview(r, team, payload)
      // Prototype: the Strategy Team's approval, with its conditions, shows up straight away
      return team === 'strategy'
        ? submitReview(sent, 'strategy', { response: SIMULATED_STRATEGY_RESPONSE })
        : sent
    })
    notify(
      team === 'internal'
        ? 'Request sent to the Internal Interest team. Waiting for their approval.'
        : 'Request sent to the Strategy Team. The Strategy Team has approved with conditions.'
    )
  }

  // A reviewing team submits, which counts as that stage's approval
  const handleSubmitReview: React.ComponentProps<typeof PartnershipDetail>['onSubmitReview'] = (
    requestId,
    team,
    payload
  ) => updateRequest(requestId, (r) => submitReview(r, team, payload))

  // Internal Interest outcome, sponsors, NDA, discovery, value and TDD
  const handleCaseAction = (requestId: string, action: CaseAction) => {
    updateRequest(requestId, (r) => applyCaseAction(r, action))
    const message = CASE_ACTION_TOASTS[action.type]
    if (message) notify(message)
  }

  // Partnership Admin routes the case
  const handleRoute = (requestId: string, routing: AdminRouting) => {
    updateRequest(requestId, (r) => routeRequest(r, routing))
    notify(
      routing.action === 'reject'
        ? 'Case has been rejected.'
        : routing.type === 'Partnership'
          ? 'Case sent to the Director.'
          : `Case routed to ${routing.type}. It is no longer in the Director's list.`
    )
  }

  const isDirectorRole = !isNonDirector && !isAdmin && !isSponsor

  // Filter requests
  // Directors and reviewers only see cases the Partnership Admin has sent on; the admin sees all
  // Reviewers only see cases the Director has sent to their team.
  const scopedRequests = isAdmin
    ? requests
    : requests.filter(
        (r) =>
          r.queue === 'director' &&
          (!isInternalTeam || r.sent?.internal) &&
          (!isStrategyTeam || r.sent?.strategy) &&
          (!isSponsor || Boolean(r.sponsors))
      )

  const filteredRequests = scopedRequests.filter((req) => {
    // Exited status hidden from internal and strategy teams
    if (isNonDirector && req.status.toLowerCase() === 'exited') {
      return false
    }

    const shownStatus = isNonDirector ? req.status : tableStatus(req.status)
    const matchesFilter =
      selectedStatusFilter === 'all' ||
      shownStatus.toLowerCase() === selectedStatusFilter.toLowerCase()

    if (!matchesFilter) return false

    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      req.requestCode.toLowerCase().includes(q) ||
      req.companyName.toLowerCase().includes(q) ||
      (!isNonDirector && req.vendorName.toLowerCase().includes(q)) ||
      req.solution.toLowerCase().includes(q) ||
      req.focusArea.toLowerCase().includes(q) ||
      req.solutionMaturity.toLowerCase().includes(q)
    )
  })

  // Filter options with dynamic counts (Pending, In progress, At Risk, Exited)
  const visibleRequestsForCount = isNonDirector
    ? scopedRequests.filter((r) => r.status.toLowerCase() !== 'exited')
    : scopedRequests

  const filterOptions = [
    { key: 'all', label: 'All requests', count: visibleRequestsForCount.length },
    {
      key: 'pending',
      label: 'Pending',
      count: scopedRequests.filter((r) => r.status === 'Pending').length,
    },
    {
      key: 'in progress',
      label: 'In Progress',
      count: scopedRequests.filter(
        (r) => (isNonDirector ? r.status : tableStatus(r.status)) === 'In Progress'
      ).length,
    },
    ...(isNonDirector
      ? [
          {
            key: 'at risk',
            label: 'At Risk',
            count: scopedRequests.filter((r) => r.status === 'At Risk').length,
          },
        ]
      : []),
    ...(!isNonDirector
      ? [
          {
            key: 'closed',
            label: 'Closed',
            count: scopedRequests.filter((r) => r.status === 'Closed').length,
          },
          {
            key: 'exited',
            label: 'Exited',
            count: scopedRequests.filter((r) => r.status === 'Exited').length,
          },
          {
            key: 'information requested',
            label: 'Information Requested',
            count: scopedRequests.filter((r) => r.status === 'Information Requested').length,
          },
        ]
      : []),
  ]

  // Detailed view rendering
  if (selectedRequest) {
    return (
      <div className="flex flex-col gap-6 w-full text-[#0d212c]">
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl bg-white border border-[#e2e8f0] text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
            <div className="w-6 h-6 rounded-lg bg-[#e6fffa] text-[#0f766e] flex items-center justify-center border border-[#ccfbf1] shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#36c0c9]" />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}
        <PartnershipDetail
          request={selectedRequest}
          allRequests={requests}
          onBack={() => setSelectedId(null)}
          onProceed={handleProceed}
          onReject={handleReject}
          onRequestInfo={handleRequestInfo}
          onResume={handleResume}
          onRoute={handleRoute}
          onLog={handleLog}
          onSendReview={handleSendReview}
          onSubmitReview={handleSubmitReview}
          onCaseAction={handleCaseAction}
          userProfile={userProfile}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full text-[#0d212c]">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl bg-white border border-[#e2e8f0] text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-lg bg-[#e6fffa] text-[#0f766e] flex items-center justify-center border border-[#ccfbf1] shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#36c0c9]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 KPI Cards — Exact same design as director flow, role-tailored metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <>
          {(isInternalTeam
            ? internalInterestKpis(scopedRequests)
            : isStrategyTeam
              ? strategyLeadKpis(scopedRequests)
              : isSponsor
                ? sponsorKpis(scopedRequests)
                : isAdmin
                  ? adminKpis(scopedRequests)
                  : directorKpis(scopedRequests)
          ).map((card, i) => (
            <div
              key={card.title}
              className="bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-[0.06em]">
                  {card.title}
                </span>
                <div className="flex items-center justify-center shrink-0">
                  {(isAdmin || isDirectorRole ? KPI_ICONS_OPERATIONS : KPI_ICONS)[i]}
                </div>
              </div>
              <div className="text-4xl font-medium text-[#0d212c] leading-none my-1">
                {card.value}
              </div>
              <div className="h-[1px] bg-slate-100 w-full" />
              <div className="text-xs font-medium text-[#64748b]">{card.caption}</div>
            </div>
          ))}
        </>
      </div>

      {/* Title */}
      <div className="pt-2">
        <h2 className="text-xl font-semibold text-[#0d212c]">Partnership Requests</h2>
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
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#36c0c9] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
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
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-medium uppercase tracking-wider">
                <th className="py-4 px-4">Case ID</th>
                {isNonDirector ? (
                  <>
                    <th className="py-4 px-4">Company name</th>
                    <th className="py-4 px-4">Focus Area</th>
                    <th className="py-4 px-4">Solution Maturity</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Deadline</th>
                    <th className="py-4 px-4">Submitted Date</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-4">Company</th>
                    <th className="py-4 px-4">Solution description</th>
                    <th className="py-4 px-4">Status</th>
                    {isAdmin && <th className="py-4 px-4">Type</th>}
                    <th className="py-4 px-4">Stage</th>
                    <th className="py-4 px-4">Days in stage</th>
                    <th className="py-4 px-4">Owner</th>
                    <th className="py-4 px-4">SLA status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={isNonDirector ? 7 : isAdmin ? 9 : 8}
                    className="py-16 text-center text-[#64748b]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Inbox className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-medium text-xs text-[#0d212c]">
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
                    onClick={() => setSelectedId(req.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4.5 px-4 text-xs font-medium text-[#64748b] whitespace-nowrap">
                      {req.requestCode}
                    </td>

                    <td className="py-4.5 px-4 text-xs font-medium text-[#0d212c] group-hover:text-[#36c0c9]">
                      {req.companyName}
                    </td>

                    {isNonDirector ? (
                      <>
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

                        <td className="py-4.5 px-4 text-xs font-normal text-[#64748b] whitespace-nowrap">
                          {req.submittedOn}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4.5 px-4">
                          <DescriptionCell
                            text={
                              req.assessmentAreas?.productPlatformServiceDetails || req.solution
                            }
                          />
                        </td>

                        <td className="py-4.5 px-4 text-xs font-normal">
                          <StatusChip
                            label={tableStatus(req.status)}
                            status={getStatusCategory(tableStatus(req.status))}
                            dot={false}
                          />
                        </td>

                        {isAdmin && (
                          <td className="py-4.5 px-4 text-xs font-normal text-[#0d212c] whitespace-nowrap">
                            {req.caseType ? (
                              <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                                {req.caseType}
                              </span>
                            ) : (
                              <span className="text-[#94a3b8]">Unassigned</span>
                            )}
                          </td>
                        )}

                        <td className="py-4.5 px-4 text-xs font-normal text-[#0d212c] whitespace-nowrap">
                          {getStageLabel(req)}
                        </td>

                        <td className="py-4.5 px-4 text-xs font-normal text-[#64748b] whitespace-nowrap">
                          {req.daysInStage} {req.daysInStage === 1 ? 'day' : 'days'}
                        </td>

                        <td className="py-4.5 px-4 text-xs font-normal text-[#0d212c] whitespace-nowrap">
                          {req.owner}
                        </td>

                        <td
                          className={`py-4.5 px-4 text-xs font-medium whitespace-nowrap ${SLA_TEXT_COLOR[req.slaStatus]}`}
                        >
                          {req.slaStatus}
                        </td>
                      </>
                    )}
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
