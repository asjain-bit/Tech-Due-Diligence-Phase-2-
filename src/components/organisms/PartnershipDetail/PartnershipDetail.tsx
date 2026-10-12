'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  Mail,
  Phone,
  Sparkles,
  Layers,
  HeartHandshake,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'

export const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  request,
  onBack,
  onProceed,
  onReject,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [reason, setReason] = useState(request.decision?.reason || '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [activeDecision, setActiveDecision] = useState<'proceed' | 'reject' | null>(null)
  const [previewDocName, setPreviewDocName] = useState<string | null>(null)

  const handleProceedClick = () => {
    setActiveDecision('proceed')
    setValidationError(null)
    onProceed(request.id, reason.trim())
  }

  const handleRejectClick = () => {
    setActiveDecision('reject')
    if (!reason.trim()) {
      setValidationError(
        'A reason is mandatory when rejecting a partnership request. Please enter a reason.'
      )
      return
    }
    setValidationError(null)
    onReject(request.id, reason.trim())
  }

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

  return (
    <div className={`flex flex-col gap-6 w-full text-[#0d212c] ${className}`.trim()}>
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#e2e8f0] hover:bg-slate-100 transition cursor-pointer text-[#0d212c] hover:text-[#008080]"
            aria-label="Back to Partnership Requests"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold text-[#64748b] flex items-center gap-1.5">
              <span>M42 admin</span>
              <span>/</span>
              <button onClick={onBack} className="hover:underline text-[#64748b] cursor-pointer">
                Partnership Requests
              </button>
              <span>/</span>
              <span className="text-[#0f766e] font-bold truncate max-w-xs sm:max-w-md">
                {request.companyName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0d212c] tracking-tight mt-0.5">
              {request.solution}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <StatusChip label={request.status} status={getStatusCategory(request.status)} dot />
        </div>
      </div>

      {/* Tabs Row — Exact Design matching Image 3 */}
      <div className="border-b border-[#e2e8f0] flex items-center gap-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'text-[#0f766e] font-bold border-b-2 border-[#00bfa5]'
              : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('brief')}
          className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'brief'
              ? 'text-[#0f766e] font-bold border-b-2 border-[#00bfa5]'
              : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
          }`}
        >
          Brief
        </button>
        <button
          onClick={() => setActiveTab('audit_log')}
          className={`pb-3 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit_log'
              ? 'text-[#0f766e] font-bold border-b-2 border-[#00bfa5]'
              : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
          }`}
        >
          <span>Audit Log</span>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-150">
          {/* Section 1: Partnership Request Workflow (Matching Image 1 & Image 3) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
            <h2 className="text-base sm:text-lg font-bold text-[#0d212c]">
              Partnership Request Workflow
            </h2>

            {/* Horizontal Workflow Stepper */}
            <div className="w-full overflow-x-auto pb-4 pt-2">
              <div className="min-w-[760px] flex items-start justify-between relative px-2">
                {request.workflowStages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed'
                  const isInProgress = stage.status === 'in_progress'
                  const isNotStarted = stage.status === 'not_started'
                  const isLast = idx === request.workflowStages.length - 1

                  return (
                    <div
                      key={stage.id}
                      className="flex-1 flex flex-col items-center relative group"
                    >
                      {/* Connecting Line to next stage */}
                      {!isLast && (
                        <div
                          className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${
                            isCompleted
                              ? 'bg-[#10b981]'
                              : isInProgress
                                ? 'border-t-2 border-dashed border-[#36c0c9]'
                                : 'border-t-2 border-dotted border-[#cbd5e1]'
                          }`}
                        />
                      )}

                      {/* Stage Circle Indicator */}
                      <div className="relative z-10 mb-2.5">
                        {isCompleted && (
                          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        {isInProgress && (
                          <div className="w-8 h-8 rounded-full bg-[#06b6d4] flex items-center justify-center text-white font-bold text-sm shadow-xs ring-4 ring-[#06b6d4]/20">
                            {stage.id}
                          </div>
                        )}
                        {isNotStarted && (
                          <div className="w-8 h-8 rounded-full bg-white border border-[#cbd5e1] flex items-center justify-center text-[#94a3b8] font-bold text-sm">
                            {stage.id}
                          </div>
                        )}
                      </div>

                      {/* Stage Title */}
                      <div className="text-center px-1">
                        <div
                          className={`text-xs sm:text-sm font-bold ${
                            isInProgress
                              ? 'text-[#06b6d4]'
                              : isCompleted
                                ? 'text-[#10b981]'
                                : 'text-[#0d212c]'
                          }`}
                        >
                          {stage.title}
                        </div>
                        {/* Subheading: strictly Completed / In Progress / Not Started */}
                        <div
                          className={`text-[11px] font-medium mt-0.5 ${
                            isCompleted
                              ? 'text-[#64748b]'
                              : isInProgress
                                ? 'text-[#06b6d4] font-semibold'
                                : 'text-[#94a3b8]'
                          }`}
                        >
                          {stage.subheading}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section 2: 4 Metadata Cards from Image 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* EVIDENCE */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                EVIDENCE
              </span>
              <span className="text-base sm:text-lg font-bold text-[#0d212c] mt-1.5">
                {request.overviewCards.evidence}
              </span>
            </div>

            {/* DEPLOYMENT */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                DEPLOYMENT
              </span>
              <span className="text-base sm:text-lg font-bold text-[#0d212c] mt-1.5">
                {request.overviewCards.deployment}
              </span>
            </div>

            {/* REGULATORY */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                REGULATORY
              </span>
              <span className="text-base sm:text-lg font-bold text-[#0d212c] mt-1.5">
                {request.overviewCards.regulatory}
              </span>
            </div>

            {/* DUPLICATE CHECK */}
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                DUPLICATE CHECK
              </span>
              <span className="text-base sm:text-lg font-bold text-[#0d212c] mt-1.5">
                {request.overviewCards.duplicateCheck}
              </span>
            </div>
          </div>

          {/* Section 3: SOW Details (Matching Image 3) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0d212c] tracking-tight">SOW Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">SOW Name</label>
                <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] truncate shadow-2xs">
                  {request.sowDetails.sowName}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">SOW Deadline</label>
                <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center justify-between shadow-2xs">
                  <span>{request.sowDetails.sowDeadline}</span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Token Consumption</label>
                <div className="bg-white border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] shadow-2xs">
                  {request.sowDetails.tokenConsumption}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Uploaded Documents (Matching Image 3) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0d212c] tracking-tight">Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {request.uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-[#36c0c9]/40 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 text-pink-600 font-bold text-xs">
                      <FileText className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#0d212c] truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {doc.size} · {doc.type}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewDocName(doc.name)}
                    className="text-xs font-semibold text-[#0f766e] hover:text-[#00bfa5] transition cursor-pointer whitespace-nowrap group-hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Preview</span>
                    <span>→</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Mock preview alert banner if clicked */}
            {previewDocName && (
              <div className="p-3 bg-[#e6f4ea] border border-[#ceebd6] rounded-xl flex items-center justify-between text-xs text-[#137333]">
                <span>
                  Document preview loaded for <strong>{previewDocName}</strong>
                </span>
                <button
                  onClick={() => setPreviewDocName(null)}
                  className="text-xs font-bold hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BRIEF TAB (Detailed Application Submission) */}
      {activeTab === 'brief' && (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-150">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-[#D9E6EB]/50 to-white p-6 rounded-2xl border border-[#D9E6EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#0f766e] uppercase tracking-wider">
                Partnership Proposal Brief
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0d212c] mt-0.5">
                {request.companyInfo.company}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Submitted by {request.companyInfo.name} ({request.companyInfo.jobTitle}) on{' '}
                {request.submittedOn}. Review all required submission disclosures below to proceed
                or reject.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip label={request.status} status={getStatusCategory(request.status)} dot />
            </div>
          </div>

          {/* Group 1: Company Information */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e8f0]">
              <Building2 className="w-5 h-5 text-[#0f766e]" />
              <h3 className="text-base font-bold text-[#0d212c]">Company Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Name * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Name <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{request.companyInfo.name}</span>
                </div>
              </div>

              {/* Job Title * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Job Title <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] truncate">
                  {request.companyInfo.jobTitle}
                </div>
              </div>

              {/* Company * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Company <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{request.companyInfo.company}</span>
                </div>
              </div>

              {/* Phone Number (optional - no asterisk) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {request.companyInfo.phoneNumber || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Email Address * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Email Address <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{request.companyInfo.email}</span>
                </div>
              </div>

              {/* Year Company Was Founded * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Year Company Was Founded <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{request.companyInfo.yearFounded}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Key Assessment Areas */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e8f0]">
              <Sparkles className="w-5 h-5 text-[#0f766e]" />
              <h3 className="text-base font-bold text-[#0d212c]">Key Assessment Areas</h3>
            </div>

            <div className="flex flex-col gap-6">
              {/* Question 1: Stage of maturity and experience * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  How would you describe your company&apos;s stage of maturity and experience?{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Company&apos;s growth journey and regional experience. Include relevant milestones
                  such as product launches, market entries or partnerships in uae or other
                  healthcare systems.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.stageOfMaturityAndExperience}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.growthJourneyAndRegionalExperience}
                </div>
              </div>

              {/* Question 2: Briefly describe your proposal of collaboration * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  Briefly describe your proposal of collaboration.{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Details about product, platform or service you are submitting for consideration.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.proposalOfCollaboration}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.productPlatformServiceDetails}
                </div>
              </div>

              {/* Question 3: Focus Area dropdown / tags * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  Which Focus Area does your solution address?{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select the primary area your solution addresses. These focus areas align with M42
                  transformation and innovation priorities. Select all that apply.
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.assessmentAreas.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#36c0c9]/10 text-[#0f766e] text-xs font-bold border border-[#36c0c9]/30 flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Question 4: Maturity level & Regulatory approvals * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  What is the current maturity level of your solution and have you secured any
                  regulatory approvals or certifications (if applicable)?{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Briefly describe solution&apos;s current stage of maturity, any deployments to
                  date and regulatory clearances obtained (eg. CE, FDA, DoH Abu Dhabi).
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.solutionMaturityLevelAndRegulatory}
                </div>
              </div>

              {/* Question 5: List relevant approvals (optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  Please list any relevant approvals (e.g. CE. FDA. ISO, UAE MOHAP. DOH) or state
                  &quot;Not applicable.&quot;
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.relevantApprovals || 'Not applicable.'}
                </div>
              </div>

              {/* Question 6: How novel or differentiated * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  How novel or differentiated is your solution compared to others in the market?{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Assess the innovation potential, uniqueness and whether the solution brings new
                  intellectual property or care modules to M42.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.noveltyAndDifferentiation}
                </div>
              </div>

              {/* Question 7: Development approach (optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  If applicable, was the solution developed entirety your team or in collaboration
                  with external partners?
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Understand whether solution was developed internally, co-developed with partners
                  or built using 3rd party technologies or platforms. Indicate primary development
                  approach.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.developmentApproach || 'Developed internally.'}
                </div>
              </div>

              {/* Question 8: Requested resources from M42 * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  What specific resources, input. or partnerships are you seeking from M42?{' '}
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Outline type of support expected such as data, access, clinical, collaboration,
                  technical integration, funding or pilot sites.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                  {request.assessmentAreas.requestedM42Resources}
                </div>
              </div>

              {/* Question 9: Impacted patient populations (checkboxes - optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0d212c]">
                  If applicable, which patient populations, clinical area, or operational workflows
                  will be impacted?
                </label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Identify who or what will be directly affected by your solution (ie. patients,
                  clinical teams, care pathways or administrative workflows) to help assess
                  relevance and scope.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                  {['Adult patients', 'pediatric patients', "women's health"].map((pop) => {
                    const isChecked = request.assessmentAreas.impactedPatientPopulations?.some(
                      (p) => p.toLowerCase() === pop.toLowerCase()
                    )
                    return (
                      <div
                        key={pop}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                          isChecked
                            ? 'bg-[#36c0c9]/5 border-[#36c0c9]/40 text-[#0d212c]'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#0f766e] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span
                          className={`text-xs font-semibold ${isChecked ? 'text-[#0d212c]' : 'text-slate-400'}`}
                        >
                          {pop}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Director Evaluation & Decision Action Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-md flex flex-col gap-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e8f0]">
              <HeartHandshake className="w-5 h-5 text-[#0f766e]" />
              <div>
                <h3 className="text-base font-bold text-[#0d212c]">
                  Director Evaluation & Decision
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record your evaluation rationale and proceed or reject this partnership
                  submission.
                </p>
              </div>
            </div>

            {/* Decision Status if already made */}
            {request.decision && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                  request.decision.status === 'proceeded'
                    ? 'bg-[#e6f4ea] border-[#ceebd6] text-[#137333]'
                    : 'bg-[#fce8e6] border-[#f8c4c0] text-[#c5221f]'
                }`}
              >
                {request.decision.status === 'proceeded' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {request.decision.status === 'proceeded'
                      ? 'Decision: Proceeded to Next Stage'
                      : 'Decision: Request Rejected'}
                  </div>
                  {request.decision.reason && (
                    <div className="mt-1 text-xs opacity-90 leading-relaxed">
                      Reason: {request.decision.reason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reason Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="decision-reason"
                className="text-xs sm:text-sm font-bold text-[#0d212c]"
              >
                Decision Reason / Notes{' '}
                {activeDecision === 'reject' ? (
                  <span className="text-red-500 font-bold">* (Mandatory for rejection)</span>
                ) : (
                  <span className="text-slate-400 font-normal text-xs">
                    (Optional for Proceed, Mandatory for Reject)
                  </span>
                )}
              </label>

              <textarea
                id="decision-reason"
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="Enter evaluation notes, partnership criteria assessment, or rejection justification..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-1 focus:ring-[#36c0c9] bg-white transition"
              />

              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons: Proceed (optional reason) vs Reject (mandatory reason) */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={handleRejectClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                onClick={handleProceedClick}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit_log' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#e2e8f0]">
            <Lock className="w-4 h-4 text-[#0f766e]" />
            <h3 className="text-base font-bold text-[#0d212c]">Audit Trail & Activity Log</h3>
          </div>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
              <div>
                <span className="font-bold text-[#0d212c]">Submission Received</span>
                <p className="text-slate-500 mt-0.5">
                  Vendor {request.companyInfo.name} ({request.companyName}) initiated partnership
                  request via portal.
                </p>
              </div>
              <span className="text-slate-400 font-medium shrink-0">{request.submittedOn}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
              <div>
                <span className="font-bold text-[#0d212c]">Intake & Triage Completed</span>
                <p className="text-slate-500 mt-0.5">
                  Automated duplicate verification checked: Clear. Preliminary brief structured.
                </p>
              </div>
              <span className="text-slate-400 font-medium shrink-0">12 Oct 2026</span>
            </div>
            {request.decision && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                <div>
                  <span className="font-bold text-[#0d212c]">
                    Director Review Action (
                    {request.decision.status === 'proceeded' ? 'Proceed' : 'Reject'})
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    {request.decision.reason
                      ? `Feedback: ${request.decision.reason}`
                      : 'Evaluated by Director.'}
                  </p>
                </div>
                <span className="text-slate-400 font-medium shrink-0">
                  {request.decision.date || 'Today'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
