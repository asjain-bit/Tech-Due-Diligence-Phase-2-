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
  FileText,
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
  Activity,
  Award,
  Plus,
  PenLine,
  Trash2,
} from 'lucide-react'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'
import {
  DEFAULT_INTERNAL_INTERESTS,
  type InternalInterestStakeholder,
} from '@/types/partnership.types'

export const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  request,
  onBack,
  onProceed,
  onReject,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [activeNavSection, setActiveNavSection] = useState('company-info')

  // Proceed & Reject modal states (visible on Partnership Brief tab)
  const [showProceedModal, setShowProceedModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [decisionReason, setDecisionReason] = useState(request.decision?.reason || '')
  const [decisionError, setDecisionError] = useState<string | null>(null)

  // Internal Interest Stakeholders state
  const [stakeholders, setStakeholders] = useState<InternalInterestStakeholder[]>(
    request.internalInterests && request.internalInterests.length > 0
      ? request.internalInterests
      : DEFAULT_INTERNAL_INTERESTS
  )

  // Stakeholder modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStakeholder, setEditingStakeholder] = useState<InternalInterestStakeholder | null>(
    null
  )
  const [deletingStakeholder, setDeletingStakeholder] =
    useState<InternalInterestStakeholder | null>(null)
  const [maxLimitWarning, setMaxLimitWarning] = useState(false)

  // Stakeholder form states
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    expertise: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

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

  // Open add stakeholder modal
  const handleOpenAddStakeholder = () => {
    if (stakeholders.length >= 5) {
      setMaxLimitWarning(true)
      return
    }
    setFormData({ name: '', role: '', department: '', expertise: '' })
    setFormError(null)
    setIsAddModalOpen(true)
  }

  // Open edit stakeholder modal
  const handleOpenEditStakeholder = (person: InternalInterestStakeholder) => {
    setEditingStakeholder(person)
    setFormData({
      name: person.name,
      role: person.role,
      department: person.department,
      expertise: person.expertise,
    })
    setFormError(null)
  }

  // Open delete stakeholder confirmation
  const handleOpenDeleteStakeholder = (person: InternalInterestStakeholder) => {
    setDeletingStakeholder(person)
  }

  // Save new stakeholder
  const handleSaveAddStakeholder = () => {
    if (!formData.name.trim() || !formData.role.trim() || !formData.department.trim()) {
      setFormError('Please fill in Name, Role, and Department.')
      return
    }

    const initials = formData.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase()

    const colorPairs = [
      { bg: '#dbeafe', text: '#1e40af' },
      { bg: '#ede9fe', text: '#6b21a8' },
      { bg: '#dcfce7', text: '#16a34a' },
      { bg: '#ffedd5', text: '#ea580c' },
      { bg: '#fce7f3', text: '#db2777' },
      { bg: '#ccfbf1', text: '#0f766e' },
    ]
    const chosenColor = colorPairs[stakeholders.length % colorPairs.length]

    const newStakeholder: InternalInterestStakeholder = {
      id: `int-${Date.now()}`,
      name: formData.name.trim(),
      initials: initials || 'IN',
      role: formData.role.trim(),
      department: formData.department.trim(),
      expertise: formData.expertise.trim() || formData.role.trim(),
      avatarColorBg: chosenColor.bg,
      avatarColorText: chosenColor.text,
    }

    setStakeholders([...stakeholders, newStakeholder])
    setIsAddModalOpen(false)
  }

  // Save edited stakeholder
  const handleSaveEditStakeholder = () => {
    if (!editingStakeholder) return
    if (!formData.name.trim() || !formData.role.trim() || !formData.department.trim()) {
      setFormError('Please fill in Name, Role, and Department.')
      return
    }

    const initials = formData.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .substring(0, 2)
      .toUpperCase()

    setStakeholders(
      stakeholders.map((person) =>
        person.id === editingStakeholder.id
          ? {
              ...person,
              name: formData.name.trim(),
              initials: initials || person.initials,
              role: formData.role.trim(),
              department: formData.department.trim(),
              expertise: formData.expertise.trim() || person.expertise,
            }
          : person
      )
    )
    setEditingStakeholder(null)
  }

  // Confirm delete stakeholder
  const handleConfirmDeleteStakeholder = () => {
    if (!deletingStakeholder) return
    setStakeholders(stakeholders.filter((p) => p.id !== deletingStakeholder.id))
    setDeletingStakeholder(null)
  }

  return (
    <div className={`flex flex-col gap-6 w-full text-[#0d212c] ${className}`.trim()}>
      {/* Top Back Link */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0d212c] hover:text-[#36c0c9] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partnership Requests</span>
        </button>
      </div>

      {/* Header Card — Description removed from company name, vendor designation removed, Referred by added */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Logo box */}
            <div className="w-14 h-14 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
              <Building2 className="w-8 h-8 text-[#36c0c9]" />
            </div>

            {/* Title & Status — Description underneath company name removed */}
            <div className="flex flex-col justify-center min-h-[56px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0d212c] tracking-tight">
                  {request.companyName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-[#fde8b3]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Director Review</span>
                </span>
              </div>
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

        {/* Metadata items row — Vendor designation removed, Referred by retained inside */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-[#f1f5f9] text-xs text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#0d212c]">{request.companyInfo.name}</span>
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

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Referred by:</span>
            <span className="font-semibold text-[#0d212c]">{request.referredBy || '—'}</span>
          </div>
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
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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

      {/* LARGE WHITE BOX ENCLOSING TABS AND ALL CONTENT */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {/* Tabs Bar inside the large white box */}
        <div className="flex items-center gap-8 border-b border-[#f1f5f9] pb-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'text-[#36c0c9] font-bold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`pb-3.5 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'brief'
                ? 'text-[#36c0c9] font-bold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Partnership Brief</span>
          </button>

          <button
            onClick={() => setActiveTab('internal_interest')}
            className={`pb-3.5 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'internal_interest'
                ? 'text-[#36c0c9] font-bold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Internal Interest</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 w-full animate-in fade-in duration-150">
            {/* Section 1: Workflow Progress & Agent Recommendation Chip */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-base font-bold text-[#0d212c]">Workflow Progress</h2>

                {/* Agent Recommendation added as a small info chip only (no separate card) */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6fffa] text-[#0f766e] border border-[#a7f3d0] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#36c0c9]" />
                  <span>
                    Agent Recommendation: <strong>Recommended to Proceed (94% Match)</strong>
                  </span>
                </span>
              </div>

              {/* Stepper visual starting directly from the left edge */}
              <div className="w-full overflow-x-auto pb-3 pt-2">
                <div className="min-w-[760px] flex items-start justify-start relative">
                  {request.workflowStages.map((stage, idx) => {
                    const isCompleted = stage.status === 'completed'
                    const isInProgress = stage.status === 'in_progress'
                    const isLast = idx === request.workflowStages.length - 1

                    return (
                      <div
                        key={stage.id || idx}
                        className="flex-1 flex flex-col items-start relative pr-2"
                      >
                        {/* Connecting Line from left node to next */}
                        {!isLast && (
                          <div
                            className={`absolute top-4 left-4 w-full h-[2px] -z-0 ${
                              isCompleted
                                ? 'bg-[#10b981]'
                                : isInProgress
                                  ? 'border-t-2 border-dashed border-[#36c0c9]'
                                  : 'border-t-2 border-dotted border-[#cbd5e1]'
                            }`}
                          />
                        )}

                        {/* Circle Indicator aligned on the left */}
                        <div className="relative z-10 mb-2">
                          {isCompleted && (
                            <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                          {isInProgress && (
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-[#36c0c9] flex items-center justify-center shadow-xs">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#36c0c9]" />
                            </div>
                          )}
                          {!isCompleted && !isInProgress && (
                            <div className="w-8 h-8 rounded-full bg-white border border-[#cbd5e1] flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                            </div>
                          )}
                        </div>

                        {/* Title & Subheading left-aligned */}
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#0d212c]">
                            {stage.title.replace(/^\d+[\.\s]+/, '')}
                          </div>
                          <div
                            className={`text-[11px] font-medium mt-0.5 ${
                              isInProgress ? 'text-[#36c0c9] font-semibold' : 'text-[#64748b]'
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

            <div className="h-[1px] bg-[#f1f5f9] w-full" />

            {/* Section 2: Solution Overview */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-[#0d212c]">Solution Overview</h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                {request.companyName} has proposed an AI-powered diagnostic platform that enables
                early detection of chronic diseases using medical imaging and predictive analytics.
                The solution aims to support clinicians with faster and more accurate diagnosis,
                improving patient outcomes and operational efficiency.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(
                  request.tags || [
                    'AI & Diagnostics',
                    'Medical Imaging',
                    'Clinical Decision Support',
                  ]
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

            <div className="h-[1px] bg-[#f1f5f9] w-full" />

            {/* Section 3: Key Information */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-bold text-[#0d212c]">Key Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Focus Area */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <Target className="w-4 h-4 text-[#36c0c9]" />
                    <span>Focus Area(s)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f0fdfa] text-[#0f766e] text-xs font-semibold border border-[#ccfbf1]">
                      {request.focusArea}
                    </span>
                  </div>
                </div>

                {/* Solution Maturity */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <BarChart2 className="w-4 h-4 text-[#36c0c9]" />
                    <span>Solution Maturity</span>
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                      {request.solutionMaturity}
                    </span>
                  </div>
                </div>

                {/* Regulatory Approvals */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <ShieldCheck className="w-4 h-4 text-[#36c0c9]" />
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

                {/* Patient Population */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <Users className="w-4 h-4 text-[#36c0c9]" />
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
                        className="px-2.5 py-0.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200"
                      >
                        {pop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Area(s) */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <Stethoscope className="w-4 h-4 text-[#36c0c9]" />
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
                        className="px-2.5 py-0.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Development Approach */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d212c]">
                    <Link2 className="w-4 h-4 text-[#36c0c9]" />
                    <span>Development Approach</span>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200">
                      {request.assessmentAreas.developmentApproach || 'Internally Developed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PARTNERSHIP BRIEF (Includes Proceed/Reject action bar & independent content scroll) */}
        {activeTab === 'brief' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
            {/* Top Action Header Bar with Proceed and Reject buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0d212c]">
                  Partnership Brief Review
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Detailed supplier submission and responses for clinical and technical evaluation.
                </p>
              </div>

              {/* Proceed and Reject Buttons displayed on the Partnership Brief tab */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionError(null)
                    setShowProceedModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Proceed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecisionError(null)
                    setShowRejectModal(true)
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-red-500 text-red-600 hover:bg-red-50 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>Reject</span>
                </button>
              </div>
            </div>

            {/* Two-Column Layout: Left nav is fixed beside scrollable brief content */}
            <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
              {/* Left Column: Clean Sticky Navigation List */}
              <div className="w-full lg:w-64 bg-slate-50/70 rounded-xl p-2 shrink-0 flex flex-col gap-1 sticky top-20 border border-[#e2e8f0]/60">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  const isActive = activeNavSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition flex items-center gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#36c0c9] font-bold shadow-2xs border-l-3 border-[#36c0c9]'
                          : 'text-[#64748b] hover:bg-white/60 hover:text-[#0d212c]'
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#36c0c9]' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Right Column: Independent Scrolling — Only brief content scrolls, not the entire screen */}
              <div className="flex-1 flex flex-col divide-y divide-[#f1f5f9] min-w-0 w-full max-h-[calc(100vh-320px)] overflow-y-auto pr-3 overscroll-contain">
                {/* 1. Company Information */}
                <div id="company-info" className="pb-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-bold text-[#0d212c]">1. Company Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
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

                    <div>
                      <div className="text-xs font-semibold text-[#64748b]">Referred By</div>
                      <div className="text-sm font-semibold text-[#0d212c] mt-1">
                        {request.referredBy || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Company's Stage of Maturity and Experience */}
                <div id="company-experience" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#36c0c9]" />
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
                <div id="collaboration-proposal" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-bold text-[#0d212c]">
                      3. Proposal of Collaboration
                    </h3>
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
                <div id="focus-area" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#36c0c9]" />
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

                {/* 5. Solution Maturity */}
                <div id="solution-maturity" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#36c0c9]" />
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
                <div id="regulatory-approvals" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-bold text-[#0d212c]">
                      6. Regulatory Approvals Checklist
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(
                      request.assessmentAreas.regulatoryApprovalList || [
                        'FDA',
                        'CE',
                        'Not applicable',
                      ]
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
                  className="py-8 scroll-mt-24 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#36c0c9]" />
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
                <div id="development-approach" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-bold text-[#0d212c]">8. Development Approach</h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {request.assessmentAreas.developmentApproach ||
                      'Internally developed by proprietary core team.'}
                  </p>
                </div>

                {/* 9. Support from M42 */}
                <div id="support-from-m42" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#36c0c9]" />
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
                <div id="target-population" className="pt-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-bold text-[#0d212c]">
                      10. Target Patient Population &amp; Impact
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Adult patients', 'Pediatric patients', "Women's health"].map((pop) => {
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
          </div>
        )}

        {/* TAB 3: INTERNAL INTEREST (Count column removed, Edit/Delete are icons only) */}
        {activeTab === 'internal_interest' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
            {/* Header: Title (NO icon), subtitle, and "+ Add Interest" button with tooltip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0d212c]">Internal Interest</h2>
                <p className="text-xs sm:text-sm text-[#64748b] mt-1">
                  Manage internal stakeholders who will review this partnership based on their
                  domain expertise.
                </p>
              </div>

              {/* Add Interest button with custom tooltip showing "Add up to 5 people" */}
              <div className="relative group inline-block shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddStakeholder}
                  className="px-4 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Interest</span>
                </button>
                {/* Custom Tooltip */}
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute right-0 top-full mt-2 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl text-center">
                  Add up to 5 people
                  <div className="absolute bottom-full right-4 border-4 border-transparent border-b-[#0d212c]" />
                </div>
              </div>
            </div>

            {/* Stakeholders Table — Count column removed, Actions are icons only */}
            <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Expertise</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]">
                    {stakeholders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#64748b]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users className="w-6 h-6 text-slate-300" />
                            <div className="text-xs font-semibold text-[#0d212c]">
                              No stakeholders added yet
                            </div>
                            <div className="text-xs text-[#64748b]">
                              Click &quot;+ Add Interest&quot; to assign review team members.
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      stakeholders.map((person) => (
                        <tr key={person.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Name with initials badge */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                style={{
                                  backgroundColor: person.avatarColorBg,
                                  color: person.avatarColorText,
                                }}
                              >
                                {person.initials}
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-[#0d212c]">
                                {person.name}
                              </span>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4 text-xs text-[#0d212c] font-medium">
                            {person.role}
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 text-xs text-[#475569]">
                            {person.department}
                          </td>

                          {/* Expertise */}
                          <td className="py-3.5 px-4 text-xs text-[#475569]">{person.expertise}</td>

                          {/* Actions: Edit & Delete using ONLY icons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStakeholder(person)}
                                title="Edit stakeholder"
                                aria-label="Edit stakeholder"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#36c0c9] hover:bg-[#36c0c9]/10 transition cursor-pointer"
                              >
                                <PenLine className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteStakeholder(person)}
                                title="Delete stakeholder"
                                aria-label="Delete stakeholder"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODALS — Designed strictly matching SOW Generator App */}

      {/* PROCEED CONFIRMATION MODAL (For Brief Tab) */}
      {showProceedModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#0f766e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#36c0c9]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d212c]">Proceed to Next Stage</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Advance request to Screening &amp; Fit stage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProceedModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
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
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Add optional director evaluation feedback or next steps..."
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowProceedModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onProceed?.(request.id, decisionReason.trim())
                  setShowProceedModal(false)
                }}
                className="px-5 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm &amp; Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL (For Brief Tab) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d212c]">Reject Partnership Request</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    A mandatory reason is required to reject
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
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
                value={decisionReason}
                onChange={(e) => {
                  setDecisionReason(e.target.value)
                  if (decisionError) setDecisionError(null)
                }}
                placeholder="Provide clear rationale for rejecting this partnership request..."
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 bg-slate-50/50"
              />
              {decisionError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!decisionReason.trim()) {
                    setDecisionError('A reason is mandatory when rejecting a partnership request.')
                    return
                  }
                  setDecisionError(null)
                  onReject?.(request.id, decisionReason.trim())
                  setShowRejectModal(false)
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STAKEHOLDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#0d212c]">Add Internal Stakeholder</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Assign a domain expert to review this partnership request.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Fatima Al Mansoori"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Role / Title <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Head of AI & Analytics"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Department <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Medical Imaging"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">Domain Expertise</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g. Clinical Validation"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddStakeholder}
                className="px-5 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Add Stakeholder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STAKEHOLDER MODAL */}
      {editingStakeholder && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#0d212c]">Edit Internal Stakeholder</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Update stakeholder details and domain focus.
                </p>
              </div>
              <button
                onClick={() => setEditingStakeholder(null)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Full Name <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Role / Title <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">
                  Department <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0d212c]">Domain Expertise</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-[#36c0c9] focus:ring-2 focus:ring-[#36c0c9]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setEditingStakeholder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditStakeholder}
                className="px-5 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStakeholder && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setDeletingStakeholder(null)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0d212c]">Remove Stakeholder</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-[#0d212c]">{deletingStakeholder.name}</strong> from the
                internal review panel?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeletingStakeholder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0d212c] hover:bg-slate-50 transition cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStakeholder}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAX LIMIT WARNING MODAL */}
      {maxLimitWarning && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setMaxLimitWarning(false)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0d212c]">Maximum Limit Reached</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                You can add up to 5 internal stakeholders per partnership request. Please edit or
                remove an existing stakeholder to add another.
              </p>
            </div>
            <div className="w-full mt-2">
              <button
                onClick={() => setMaxLimitWarning(false)}
                className="w-full px-5 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
