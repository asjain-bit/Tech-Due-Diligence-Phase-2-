'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GitMerge,
  FileText,
  Info,
  Target,
  BarChart2,
  ShieldCheck,
  Users,
  Stethoscope,
  Link2,
  Building2,
  Sparkles,
  Layers,
  HeartHandshake,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Award,
} from 'lucide-react'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'

export const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  request,
  onBack,
  onProceed,
  onReject,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [activeNavSection, setActiveNavSection] = useState('company-info')
  const [showProceedModal, setShowProceedModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reason, setReason] = useState(request.decision?.reason || '')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleConfirmProceed = () => {
    onProceed(request.id, reason.trim())
    setShowProceedModal(false)
  }

  const handleConfirmReject = () => {
    if (!reason.trim()) {
      setValidationError('A reason is mandatory when rejecting a partnership request.')
      return
    }
    setValidationError(null)
    onReject(request.id, reason.trim())
    setShowRejectModal(false)
  }

  const navItems = [
    { id: 'company-info', label: 'Company Information', icon: Building2 },
    { id: 'company-experience', label: 'Company Experience', icon: Award },
    { id: 'collaboration-proposal', label: 'Collaboration Proposal', icon: HeartHandshake },
    { id: 'focus-area', label: 'Focus Area', icon: Target },
    { id: 'solution-maturity', label: 'Solution Maturity', icon: Activity },
    { id: 'regulatory-approvals', label: 'Regulatory Approvals', icon: ShieldCheck },
    { id: 'innovation-differentiation', label: 'Innovation & Differentiation', icon: Sparkles },
    { id: 'development-approach', label: 'Development Approach', icon: Layers },
    { id: 'support-from-m42', label: 'Support from M42', icon: HeartHandshake },
    { id: 'target-population', label: 'Target Population & Impact', icon: Users },
  ]

  const scrollToSection = (id: string) => {
    setActiveNavSection(id)
    const element = document.getElementById(id)
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={`flex flex-col gap-6 w-full text-[#0d212c] ${className}`.trim()}>
      {/* Top Back Link */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0d212c] hover:text-[#0f766e] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partnership Requests</span>
        </button>
      </div>

      {/* Header Card — Exactly matching Images 2 & 3 */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Logo box */}
            <div className="w-14 h-14 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
              <Building2 className="w-8 h-8 text-[#0f766e]" />
            </div>

            {/* Title, Status, and Subtitle */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0d212c] tracking-tight">
                  {request.companyName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#fde8b3]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Director Review</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#64748b] mt-1">
                {request.headline || request.solution}
              </p>
            </div>
          </div>

          {/* Submitted on date */}
          <div className="text-xs text-[#64748b] shrink-0 text-left md:text-right">
            <div>Submitted on</div>
            <div className="font-semibold text-[#0d212c] mt-0.5">
              {request.submittedOn}{' '}
              <span className="font-normal text-[#64748b]">
                ({request.submittedRelative || 'recently'})
              </span>
            </div>
          </div>
        </div>

        {/* Metadata items row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-[#f1f5f9] text-xs text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#0d212c]">{request.companyInfo.name}</span>
            <span className="text-slate-400">·</span>
            <span>{request.companyInfo.jobTitle}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{request.companyInfo.email}</span>
          </div>

          {request.companyInfo.phoneNumber && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{request.companyInfo.phoneNumber}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Founded in {request.companyInfo.yearFounded}</span>
          </div>

          {request.companyInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{request.companyInfo.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs and Action Buttons Bar — Matching Images 2 & 3 */}
      <div className="border-b border-[#e2e8f0] flex items-center justify-between gap-4 pb-0">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#0f766e] font-bold border-b-2 border-[#0f766e]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'brief'
                ? 'text-[#0f766e] font-bold border-b-2 border-[#0f766e]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            Partnership Brief
          </button>
        </div>

        {/* Action buttons (Shown on top bar as in Image 3) */}
        <div className="flex items-center gap-3 pb-2.5">
          <button
            onClick={() => {
              setValidationError(null)
              setShowProceedModal(true)
            }}
            className="px-4 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Proceed</span>
          </button>

          <button
            onClick={() => {
              setValidationError(null)
              setShowRejectModal(true)
            }}
            className="px-4 py-2 rounded-xl bg-white border border-red-500 text-red-600 hover:bg-red-50 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Decision Status Banner (if decision has already been recorded) */}
      {request.decision && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm animate-in fade-in ${
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
                ? 'Status: Approved to Proceed'
                : 'Status: Request Rejected'}
            </div>
            {request.decision.reason && (
              <div className="mt-1 text-xs opacity-90 leading-relaxed">
                Director Notes: {request.decision.reason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW TAB CONTENT (Exactly matching Image 2) */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
          {/* Card 1: Workflow Progress */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <GitMerge className="w-5 h-5 text-[#0f766e]" />
              <h2 className="text-base font-bold text-[#0d212c]">Workflow Progress</h2>
            </div>

            {/* Stepper horizontal row */}
            <div className="w-full overflow-x-auto pb-3 pt-2">
              <div className="min-w-[760px] flex items-start justify-between relative px-2">
                {request.workflowStages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed'
                  const isInProgress = stage.status === 'in_progress'
                  const isNotStarted = stage.status === 'not_started'
                  const isLast = idx === request.workflowStages.length - 1

                  return (
                    <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${
                            isCompleted
                              ? 'bg-[#10b981]'
                              : isInProgress
                                ? 'border-t-2 border-dashed border-[#06b6d4]'
                                : 'border-t-2 border-dotted border-[#cbd5e1]'
                          }`}
                        />
                      )}

                      {/* Circle Indicator */}
                      <div className="relative z-10 mb-2">
                        {isCompleted && (
                          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        {isInProgress && (
                          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#06b6d4] text-[#06b6d4] font-bold text-sm flex items-center justify-center shadow-xs">
                            {stage.id}
                          </div>
                        )}
                        {isNotStarted && (
                          <div className="w-8 h-8 rounded-full bg-white border border-[#cbd5e1] text-[#94a3b8] font-bold text-sm flex items-center justify-center">
                            {stage.id}
                          </div>
                        )}
                      </div>

                      {/* Title & Subheading */}
                      <div className="text-center px-1">
                        <div className="text-xs font-bold text-[#0d212c]">{stage.title}</div>
                        <div
                          className={`text-[11px] font-medium mt-0.5 ${
                            isInProgress ? 'text-[#06b6d4] font-semibold' : 'text-[#64748b]'
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

          {/* Card 2: Solution Overview */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0f766e]" />
              <h2 className="text-base font-bold text-[#0d212c]">Solution Overview</h2>
            </div>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {request.companyName} has proposed an AI-powered diagnostic platform that enables
              early detection of chronic diseases using medical imaging and predictive analytics.
              The solution aims to support clinicians with faster and more accurate diagnosis,
              improving patient outcomes and operational efficiency.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(
                request.tags || ['AI & Diagnostics', 'Medical Imaging', 'Clinical Decision Support']
              ).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-[#f0fdfa] text-[#0f766e] text-xs font-semibold border border-[#ccfbf1]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Key Information (6 cards grid from Image 2) */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-[#0f766e]" />
              <h2 className="text-base font-bold text-[#0d212c]">Key Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Item 1: Focus Area(s) */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <Target className="w-4 h-4 text-[#0f766e]" />
                  <span>Focus Area(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#f0fdfa] text-[#0f766e] text-xs font-semibold border border-[#ccfbf1]">
                    {request.focusArea}
                  </span>
                </div>
              </div>

              {/* Item 2: Solution Maturity */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <BarChart2 className="w-4 h-4 text-[#0f766e]" />
                  <span>Solution Maturity</span>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                    {request.solutionMaturity}
                  </span>
                </div>
              </div>

              {/* Item 3: Regulatory Approvals */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <ShieldCheck className="w-4 h-4 text-[#0f766e]" />
                  <span>Regulatory Approvals</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    request.assessmentAreas.regulatoryApprovalList || [
                      'FDA',
                      'CE',
                      'Not applicable',
                    ]
                  ).map((appr, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                        appr === 'Not applicable'
                          ? 'bg-slate-50 text-slate-500 border-slate-200'
                          : 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]'
                      }`}
                    >
                      {appr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Item 4: Patient Population */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <Users className="w-4 h-4 text-[#0f766e]" />
                  <span>Patient Population</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    request.assessmentAreas.impactedPatientPopulations || [
                      'Adult Patients',
                      'Pediatric Patients',
                    ]
                  ).map((pop, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200"
                    >
                      {pop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Item 5: Clinical Area(s) */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <Stethoscope className="w-4 h-4 text-[#0f766e]" />
                  <span>Clinical Area(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    request.assessmentAreas.clinicalAreas || [
                      'Oncology',
                      'Radiology',
                      'Chronic Disease',
                    ]
                  ).map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Item 6: Development Approach */}
              <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                  <Link2 className="w-4 h-4 text-[#0f766e]" />
                  <span>Development Approach</span>
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
                    {request.assessmentAreas.developmentApproach || 'Internally Developed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PARTNERSHIP BRIEF TAB CONTENT (Exactly matching Image 3 Two-Column Layout) */}
      {activeTab === 'brief' && (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start animate-in fade-in duration-150">
          {/* Left Column: Vertical Navigation Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-2xl border border-[#e2e8f0] p-3 shadow-xs shrink-0 flex flex-col gap-1 sticky top-20">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#f0fdfa] text-[#0f766e] font-semibold border-l-3 border-[#0f766e]'
                      : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0d212c]'
                  }`}
                >
                  <IconComponent
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0f766e]' : 'text-slate-400'}`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Column: Submission Content Cards */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
            {/* 1. Company Information */}
            <div
              id="company-info"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-5 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Building2 className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">1. Company Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-[#64748b]">
                    Company Name <span className="text-red-500 font-bold">*</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.company}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#64748b]">
                    Contact Person Name <span className="text-red-500 font-bold">*</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.name}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#64748b]">
                    Job Title <span className="text-red-500 font-bold">*</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.jobTitle}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#64748b]">
                    Email Address <span className="text-red-500 font-bold">*</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.email}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#64748b]">Phone Number</div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.phoneNumber || 'Not provided'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#64748b]">
                    Year Company Was Founded <span className="text-red-500 font-bold">*</span>
                  </div>
                  <div className="text-sm font-semibold text-[#0d212c] mt-1">
                    {request.companyInfo.yearFounded}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Company's Stage of Maturity and Experience */}
            <div
              id="company-experience"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-5 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <BarChart2 className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  2. Company&apos;s Stage of Maturity and Experience
                </h3>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
                <p>{request.assessmentAreas.stageOfMaturityAndExperience}</p>

                <div>
                  <div className="font-bold text-[#0d212c] mb-2">Key milestones include:</div>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[#475569]">
                    {(
                      request.assessmentAreas.milestones || [
                        'Product launch in 2022',
                        'Deployment in 10+ hospitals across UAE',
                        'Strategic partnership with a leading global medical imaging provider',
                        'Ongoing collaboration with academic institutions for clinical validation',
                      ]
                    ).map((milestone, idx) => (
                      <li key={idx}>{milestone}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Collaboration Proposal */}
            <div
              id="collaboration-proposal"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <HeartHandshake className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">3. Proposal of Collaboration</h3>
              </div>

              <div className="text-xs sm:text-sm text-[#475569] leading-relaxed flex flex-col gap-3">
                <p>{request.assessmentAreas.proposalOfCollaboration}</p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-[#0d212c] mb-1">
                    Product, Platform &amp; Service Details:
                  </div>
                  <p>{request.assessmentAreas.productPlatformServiceDetails}</p>
                </div>
              </div>
            </div>

            {/* 4. Focus Area */}
            <div
              id="focus-area"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Target className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  4. Focus Area(s) <span className="text-red-500 font-bold">*</span>
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {request.assessmentAreas.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-[#f0fdfa] text-[#0f766e] text-xs font-semibold border border-[#ccfbf1]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. Solution Maturity & Regulatory Approvals */}
            <div
              id="solution-maturity"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Activity className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  5. Solution Maturity &amp; Regulatory Approvals
                </h3>
              </div>

              <div className="text-xs sm:text-sm text-[#475569] leading-relaxed flex flex-col gap-3">
                <p>{request.assessmentAreas.solutionMaturityLevelAndRegulatory}</p>
                {request.assessmentAreas.relevantApprovals && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-[#0d212c]">Regulatory Clearances: </span>
                    <span>{request.assessmentAreas.relevantApprovals}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Regulatory Approvals */}
            <div
              id="regulatory-approvals"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <ShieldCheck className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  6. Regulatory Approvals Checklist
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  request.assessmentAreas.regulatoryApprovalList || ['FDA', 'CE', 'Not applicable']
                ).map((appr, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      appr === 'Not applicable'
                        ? 'bg-slate-50 text-slate-500 border-slate-200'
                        : 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]'
                    }`}
                  >
                    {appr}
                  </span>
                ))}
              </div>
            </div>

            {/* 7. Innovation & Differentiation */}
            <div
              id="innovation-differentiation"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Sparkles className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  7. Innovation &amp; Differentiation{' '}
                  <span className="text-red-500 font-bold">*</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {request.assessmentAreas.noveltyAndDifferentiation}
              </p>
            </div>

            {/* 8. Development Approach */}
            <div
              id="development-approach"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Layers className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">8. Development Approach</h3>
              </div>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {request.assessmentAreas.developmentApproach ||
                  'Internally developed by proprietary core.'}
              </p>
            </div>

            {/* 9. Support from M42 */}
            <div
              id="support-from-m42"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <HeartHandshake className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  9. Specific Resources &amp; Support from M42{' '}
                  <span className="text-red-500 font-bold">*</span>
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {request.assessmentAreas.requestedM42Resources}
              </p>
            </div>

            {/* 10. Target Population & Impact */}
            <div
              id="target-population"
              className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col gap-4 scroll-mt-24"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
                <Users className="w-5 h-5 text-[#0f766e]" />
                <h3 className="text-base font-bold text-[#0d212c]">
                  10. Target Patient Population &amp; Impact
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Adult patients', 'pediatric patients', "women's health"].map((pop) => {
                  const isChecked = request.assessmentAreas.impactedPatientPopulations?.some(
                    (p) => p.toLowerCase() === pop.toLowerCase()
                  )
                  return (
                    <div
                      key={pop}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                        isChecked
                          ? 'bg-[#f0fdfa] border-[#ccfbf1] text-[#0d212c]'
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
      )}

      {/* PROCEED CONFIRMATION MODAL */}
      {showProceedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 max-w-md w-full shadow-xl flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#0f766e]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0d212c]">Proceed to Next Stage</h3>
                  <p className="text-xs text-[#64748b]">
                    Advance request to Screening &amp; Fit stage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProceedModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="proceed-reason" className="text-xs font-semibold text-[#0d212c]">
                Decision Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="proceed-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add optional director evaluation feedback or next steps..."
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-[#36c0c9] bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowProceedModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmProceed}
                className="px-5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm &amp; Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 max-w-md w-full shadow-xl flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0d212c]">Reject Partnership Request</h3>
                  <p className="text-xs text-[#64748b]">A mandatory reason is required to reject</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reject-reason" className="text-xs font-semibold text-[#0d212c]">
                Rejection Reason <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (validationError) setValidationError(null)
                }}
                placeholder="Provide clear rationale for rejecting this partnership request..."
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-red-400 bg-slate-50/50"
              />
              {validationError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
