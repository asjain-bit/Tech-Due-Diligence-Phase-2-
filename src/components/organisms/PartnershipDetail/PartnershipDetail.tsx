'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  Check,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
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
  Trash2,
  Info,
  Send,
  FileText,
  UserPlus,
} from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'
import {
  DEFAULT_INTERNAL_INTERESTS,
  DEFAULT_STRATEGY_MEMBERS,
  type InternalInterestStakeholder,
} from '@/types/partnership.types'

const CANDIDATE_DIRECTORY = [
  {
    id: 'cand-1',
    name: 'Dr. Mona Al Hashimi',
    role: 'Chief Medical Officer',
    department: 'Clinical Governance',
    expertise: 'Clinical Governance & Safety',
    initials: 'MH',
    avatarColorBg: '#e0e7ff',
    avatarColorText: '#3730a3',
  },
  {
    id: 'cand-2',
    name: 'Dr. Tariq Al Nuaimi',
    role: 'VP of Medical Affairs',
    department: 'Medical Operations',
    expertise: 'Clinical Protocols & Trials',
    initials: 'TN',
    avatarColorBg: '#fef3c7',
    avatarColorText: '#92400e',
  },
  {
    id: 'cand-3',
    name: 'Hessa Al Marzooqi',
    role: 'Director of Health Informatics',
    department: 'Digital Health',
    expertise: 'EHR & Systems Integration',
    initials: 'HM',
    avatarColorBg: '#dcfce7',
    avatarColorText: '#166534',
  },
  {
    id: 'cand-4',
    name: 'Sultan Al Mehairi',
    role: 'Head of Regulatory Affairs',
    department: 'Compliance & Legal',
    expertise: 'Medical Device Regulation',
    initials: 'SM',
    avatarColorBg: '#fce7f3',
    avatarColorText: '#9d174d',
  },
  {
    id: 'cand-5',
    name: 'Fatima Al Zaabi',
    role: 'Lead Clinical Bioinformatician',
    department: 'Omics Sciences',
    expertise: 'Genomic Informatics & Biomarkers',
    initials: 'FZ',
    avatarColorBg: '#ccfbf1',
    avatarColorText: '#0f766e',
  },
]

const STRATEGY_CANDIDATE_DIRECTORY = [
  {
    id: 'strat-1',
    name: 'Ahmed Darwish',
    role: 'Head of Strategy',
    department: 'Strategy',
    expertise: 'Market Strategy',
    initials: 'AD',
    avatarColorBg: '#dbeafe',
    avatarColorText: '#1e40af',
  },
  {
    id: 'strat-2',
    name: 'Leena Thomas',
    role: 'Senior Strategy Manager',
    department: 'Strategy',
    expertise: 'Growth & Expansion',
    initials: 'LT',
    avatarColorBg: '#fce7f3',
    avatarColorText: '#9d174d',
  },
  {
    id: 'strat-3',
    name: 'Omar Al-Hashemi',
    role: 'Director of Healthcare Strategy',
    department: 'Strategic Planning',
    expertise: 'Clinical Alliances & M&A',
    initials: 'OA',
    avatarColorBg: '#fef3c7',
    avatarColorText: '#92400e',
  },
  {
    id: 'strat-4',
    name: 'Nouf Al Shehhi',
    role: 'Strategy & Investments Lead',
    department: 'Corporate Strategy',
    expertise: 'HealthTech Venture Synergies',
    initials: 'NS',
    avatarColorBg: '#d1fae5',
    avatarColorText: '#065f46',
  },
]

export const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  request,
  onBack,
  onProceed,
  onReject,
  userProfile,
  className = '',
}) => {
  const isInternalTeam =
    userProfile?.id === 'evaluator' || userProfile?.roleTitle === 'Internal Interest Team'
  const isStrategyTeam =
    userProfile?.id === 'strategy-fit' || userProfile?.roleTitle === 'Strategy Team'
  const isNonDirector = isInternalTeam || isStrategyTeam

  // Delete note state
  const [deleteNote, setDeleteNote] = useState('')

  // View member response modal state
  const [viewingResponseMember, setViewingResponseMember] =
    useState<InternalInterestStakeholder | null>(null)

  // Questionnaire states for Internal Interest Team profile
  const [q1Problem, setQ1Problem] = useState(
    'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics.'
  )
  const [q2Kpi, setQ2Kpi] = useState('ICU sepsis mortality')
  const [q2Baseline, setQ2Baseline] = useState('21% over 12 months')
  const [q2Change, setQ2Change] = useState('3 points lower in 12 months')
  const [q3Sponsor, setQ3Sponsor] = useState('Yes, we would sponsor')
  const [q4Budget, setQ4Budget] = useState('Existing budget line')
  const [q5SayNo, setQ5SayNo] = useState(
    'High latency in EHR synchronization or high false positive alarm fatigue among nursing staff.'
  )
  const [aiStatementChoice, setAiStatementChoice] = useState<'yes' | 'change'>('yes')
  const [customStatement, setCustomStatement] = useState(
    'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics. An alert that reads vitals and labs continuously could get antibiotics started sooner and bring ICU sepsis mortality down.'
  )
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false)

  const allQuestionsAnswered = Boolean(
    q1Problem.trim() &&
    q2Kpi &&
    q2Baseline.trim() &&
    q2Change.trim() &&
    q3Sponsor &&
    q4Budget &&
    q5SayNo.trim()
  )

  const dynamicAiStatement = q1Problem.trim()
    ? `${q1Problem.trim().endsWith('.') ? q1Problem.trim() : q1Problem.trim() + '.'} An alert that reads vitals and labs continuously could get antibiotics started sooner and bring ${q2Kpi || 'clinical mortality'} down.`
    : 'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics. An alert that reads vitals and labs continuously could get antibiotics started sooner and bring ICU sepsis mortality down.'

  const handleSendQuestionnaire = () => {
    const finalStatement =
      aiStatementChoice === 'change' && customStatement.trim()
        ? customStatement.trim()
        : dynamicAiStatement

    const responsePayload = {
      problemAndCurrentApproach: q1Problem,
      targetKpi: q2Kpi,
      baselineToday: q2Baseline,
      changeThatMatters: q2Change,
      sponsorPilot: q3Sponsor,
      budgetLine: q4Budget,
      whatWouldMakeYouSayNo: q5SayNo,
      valueAndNeedStatement: finalStatement,
      submittedAt: 'Just now',
    }

    setStakeholders((prev) =>
      prev.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              status: 'Completed',
              decision: 'Proceed',
              response: responsePayload,
            }
          : s
      )
    )
    setQuestionnaireSubmitted(true)
  }

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [activeNavSection, setActiveNavSection] = useState('company-info')

  // Status category mapper (matching external table: Pending, In Progress, At Risk, Exited)
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

  // Proceed & Reject modal states (visible on Partnership Brief tab)
  const [showProceedModal, setShowProceedModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [decisionReason, setDecisionReason] = useState(request.decision?.reason || '')
  const [decisionError, setDecisionError] = useState<string | null>(null)

  // Internal Interest Stakeholders / Respondents state
  const [stakeholders, setStakeholders] = useState<InternalInterestStakeholder[]>(
    request.internalInterests && request.internalInterests.length > 0
      ? request.internalInterests
      : DEFAULT_INTERNAL_INTERESTS
  )

  // Add Respondant modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newDepartment, setNewDepartment] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [whyChosen, setWhyChosen] = useState('')
  const [deletingStakeholder, setDeletingStakeholder] =
    useState<InternalInterestStakeholder | null>(null)
  const [maxLimitWarning, setMaxLimitWarning] = useState(false)
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

  // Open add respondent modal
  const handleOpenAddStakeholder = () => {
    if (stakeholders.length >= 5) {
      setMaxLimitWarning(true)
      return
    }
    setSelectedCandidateId('')
    setNewRole('')
    setNewDepartment('')
    setNewExpertise('')
    setWhyChosen('')
    setFormError(null)
    setIsAddModalOpen(true)
  }

  // Open delete respondent confirmation
  const handleOpenDeleteStakeholder = (person: InternalInterestStakeholder) => {
    setDeletingStakeholder(person)
    setDeleteNote('')
  }

  // Save new respondent with dedicated fields
  const handleSaveAddStakeholder = () => {
    const candidate = CANDIDATE_DIRECTORY.find((c) => c.id === selectedCandidateId)
    if (
      !candidate ||
      !newRole.trim() ||
      !newDepartment.trim() ||
      !newExpertise.trim() ||
      !whyChosen.trim()
    ) {
      setFormError('All fields are mandatory. Please provide all required details.')
      return
    }

    const newRespondent: InternalInterestStakeholder = {
      id: `int-${Date.now()}`,
      name: candidate.name,
      initials: candidate.initials,
      role: newRole.trim(),
      department: newDepartment.trim(),
      expertise: newExpertise.trim(),
      whySuggested: whyChosen.trim(),
      avatarColorBg: candidate.avatarColorBg,
      avatarColorText: candidate.avatarColorText,
      source: 'manual',
    }

    setStakeholders([...stakeholders, newRespondent])
    setIsAddModalOpen(false)
  }

  // Confirm delete respondent
  const handleConfirmDeleteStakeholder = () => {
    if (!deletingStakeholder) return
    setStakeholders(stakeholders.filter((p) => p.id !== deletingStakeholder.id))
    setDeletingStakeholder(null)
    setDeleteNote('')
  }

  // Strategy Team state (starts with only 1 person)
  const [strategyMembers, setStrategyMembers] = useState<InternalInterestStakeholder[]>(
    request.strategyTeamMembers && request.strategyTeamMembers.length > 0
      ? request.strategyTeamMembers.slice(0, 1)
      : DEFAULT_STRATEGY_MEMBERS.slice(0, 1)
  )
  const [isAddStrategyModalOpen, setIsAddStrategyModalOpen] = useState(false)
  const [selectedStrategyCandId, setSelectedStrategyCandId] = useState('')
  const [newStrategyRole, setNewStrategyRole] = useState('')
  const [newStrategyDepartment, setNewStrategyDepartment] = useState('')
  const [newStrategyExpertise, setNewStrategyExpertise] = useState('')
  const [whyStrategyChosen, setWhyStrategyChosen] = useState('')
  const [strategyFormError, setStrategyFormError] = useState<string | null>(null)
  const [deletingStrategyMember, setDeletingStrategyMember] =
    useState<InternalInterestStakeholder | null>(null)
  const [maxStrategyLimitWarning, setMaxStrategyLimitWarning] = useState(false)

  // Send Review states
  const [showSendInternalModal, setShowSendInternalModal] = useState(false)
  const [showSendStrategyModal, setShowSendStrategyModal] = useState(false)
  const [selectedInternalSendIds, setSelectedInternalSendIds] = useState<string[]>(
    stakeholders.map((s) => s.id)
  )
  const [selectedStrategySendIds, setSelectedStrategySendIds] = useState<string[]>(
    DEFAULT_STRATEGY_MEMBERS.slice(0, 1).map((s) => s.id)
  )
  const [internalSendNote, setInternalSendNote] = useState(
    `Hi,\n\nWe have received a partnership request from ${request.companyName}. We would value your input and would like to confirm your interest in exploring this opportunity.\n\nPlease review the details in the Tech Due Diligence workspace and share your response.`
  )
  const [strategySendNote, setStrategySendNote] = useState(
    `Hi,\n\nWe have received a partnership request from ${request.companyName}. Please review the strategic alignment and market expansion potential for this partnership.\n\nPlease review the details in the Tech Due Diligence workspace and share your response.`
  )
  const [reviewToast, setReviewToast] = useState<string | null>(null)
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false)
  const [showJudgementCriteriaModal, setShowJudgementCriteriaModal] = useState(false)
  const [internalRequestSent, setInternalRequestSent] = useState(request.status === 'In Progress')
  const [strategyRequestSent, setStrategyRequestSent] = useState(request.status === 'In Progress')

  const renderRequestStatusBadge = (status?: string) => {
    const s = status || 'Pending'
    if (s === 'Completed' || s === 'Submitted') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          {s}
        </span>
      )
    }
    if (s === 'In Progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
          {s}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
        {s}
      </span>
    )
  }

  const renderDecisionBadge = (decision?: string) => {
    const d = decision?.trim()
    if (!d || d === '-') {
      return <span className="text-[#94a3b8] font-medium text-xs sm:text-sm pl-1">-</span>
    }
    const isProceed = d.toLowerCase() === 'proceed' || d.toLowerCase() === 'interested'
    const isDecline =
      d.toLowerCase() === 'decline' ||
      d.toLowerCase() === 'reject' ||
      d.toLowerCase() === 'declined'

    if (isProceed) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Proceed
        </span>
      )
    }
    if (isDecline) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Decline
        </span>
      )
    }
    return <span className="text-[#94a3b8] font-medium text-xs sm:text-sm pl-1">-</span>
  }

  // Handlers for Strategy Team
  const handleOpenAddStrategyMember = () => {
    if (strategyMembers.length >= 2) {
      setMaxStrategyLimitWarning(true)
      return
    }
    setSelectedStrategyCandId('')
    setNewStrategyRole('')
    setNewStrategyDepartment('')
    setNewStrategyExpertise('')
    setWhyStrategyChosen('')
    setStrategyFormError(null)
    setIsAddStrategyModalOpen(true)
  }

  const handleOpenDeleteStrategyMember = (person: InternalInterestStakeholder) => {
    setDeletingStrategyMember(person)
  }

  const handleSaveAddStrategyMember = () => {
    const candidate = STRATEGY_CANDIDATE_DIRECTORY.find((c) => c.id === selectedStrategyCandId)
    if (
      !candidate ||
      !newStrategyRole.trim() ||
      !newStrategyDepartment.trim() ||
      !newStrategyExpertise.trim() ||
      !whyStrategyChosen.trim()
    ) {
      setStrategyFormError('All fields are mandatory. Please provide all required details.')
      return
    }

    const newMember: InternalInterestStakeholder = {
      id: `strat-${Date.now()}`,
      name: candidate.name,
      initials: candidate.initials,
      role: newStrategyRole.trim(),
      department: newStrategyDepartment.trim(),
      expertise: newStrategyExpertise.trim(),
      whySuggested: whyStrategyChosen.trim(),
      avatarColorBg: candidate.avatarColorBg,
      avatarColorText: candidate.avatarColorText,
      source: 'manual',
    }

    setStrategyMembers([...strategyMembers, newMember])
    setSelectedStrategySendIds((prev) => [...prev, newMember.id])
    setIsAddStrategyModalOpen(false)
  }

  const handleConfirmDeleteStrategyMember = () => {
    if (!deletingStrategyMember) return
    setStrategyMembers(strategyMembers.filter((p) => p.id !== deletingStrategyMember.id))
    setSelectedStrategySendIds((prev) => prev.filter((id) => id !== deletingStrategyMember.id))
    setDeletingStrategyMember(null)
  }

  // Toggle selection for Internal Interest Review Modal
  const toggleInternalSendMember = (id: string) => {
    setSelectedInternalSendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle selection for Strategy Team Review Modal
  const toggleStrategySendMember = (id: string) => {
    setSelectedStrategySendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Auto-dismiss review toast
  React.useEffect(() => {
    if (reviewToast) {
      const timer = setTimeout(() => setReviewToast(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [reviewToast])

  // Lock body scroll when any modal/popup is open
  const isAnyModalOpen = Boolean(
    showProceedModal ||
    showRejectModal ||
    isAddModalOpen ||
    deletingStakeholder ||
    maxLimitWarning ||
    showSendInternalModal ||
    showSendStrategyModal ||
    isAddStrategyModalOpen ||
    deletingStrategyMember ||
    maxStrategyLimitWarning ||
    showQuestionnaireModal ||
    showJudgementCriteriaModal
  )

  React.useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isAnyModalOpen])

  return (
    <div className={`flex flex-col gap-6 w-full text-[#0d212c] ${className}`.trim()}>
      {/* Top Back Link */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0d212c] hover:text-[#36c0c9] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partnership Requests</span>
        </button>
      </div>

      {/* Header Card — Status matches outside table, Submitted on moved to bottom right of Overview */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Logo box */}
            <div className="w-14 h-14 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
              <Building2 className="w-8 h-8 text-[#36c0c9]" />
            </div>

            {/* Title & Status — Same status as outside, no additional text */}
            <div className="flex flex-col justify-center min-h-[56px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-[#0d212c] tracking-tight">
                  {request.companyName}
                </h1>
                <StatusChip
                  label={request.status}
                  status={getStatusCategory(request.status)}
                  dot={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata items row — Vendor designation removed, Referred by retained inside, Submitted on on bottom right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-6 gap-y-2 pt-4 border-t border-[#f1f5f9] text-xs text-[#64748b]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {!isNonDirector && (
              <>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-[#0d212c]">{request.companyInfo.name}</span>
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
              </>
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

            {!isNonDirector && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Referred by:</span>
                <span className="font-medium text-[#0d212c]">{request.referredBy || '—'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-[#64748b] sm:ml-auto shrink-0 self-end sm:self-auto">
            <span>Submitted on:</span>
            <span className="font-medium text-[#0d212c]">{request.submittedOn}</span>
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
            <div className="font-semibold">
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
        <div role="tablist" className="flex items-center gap-8 border-b border-[#f1f5f9] pb-0">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-medium transition-all relative cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#36c0c9] font-semibold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <span>Overview</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'brief'}
            onClick={() => setActiveTab('brief')}
            className={`pb-3.5 text-sm font-medium transition-all relative cursor-pointer ${
              activeTab === 'brief'
                ? 'text-[#36c0c9] font-semibold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <span>Partnership Brief</span>
          </button>

          {isInternalTeam && (
            <button
              role="tab"
              aria-selected={activeTab === 'questionnaire'}
              onClick={() => setActiveTab('questionnaire')}
              className={`pb-3.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === 'questionnaire'
                  ? 'text-[#36c0c9] font-semibold border-b-2 border-[#36c0c9]'
                  : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
              }`}
            >
              <span>Questionnaire</span>
            </button>
          )}

          {!isNonDirector && (
            <button
              role="tab"
              aria-selected={activeTab === 'internal_review' || activeTab === 'internal_interest'}
              onClick={() => setActiveTab('internal_review')}
              className={`pb-3.5 text-sm font-medium transition-all relative cursor-pointer ${
                activeTab === 'internal_review' || activeTab === 'internal_interest'
                  ? 'text-[#36c0c9] font-semibold border-b-2 border-[#36c0c9]'
                  : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
              }`}
            >
              <span>Internal Review</span>
            </button>
          )}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 w-full animate-in fade-in duration-150">
            {/* Section 1: Workflow Progress & Agent Recommendation Chip */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-base font-semibold text-[#0d212c]">Workflow Progress</h2>

                {/* Agent Recommendation: one word proceed/reject and confidence level high/medium/low */}
                {(() => {
                  const recWord =
                    request.agentRecommendation?.status === 'reject' ? 'Reject' : 'Proceed'
                  const rawConf = request.agentRecommendation?.confidence ?? 94
                  const confLevel = rawConf >= 80 ? 'High' : rawConf >= 50 ? 'Medium' : 'Low'
                  const isReject = recWord === 'Reject'
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shadow-2xs border ${
                        isReject
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-[#e6fffa] text-[#0f766e] border-[#a7f3d0]'
                      }`}
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 ${isReject ? 'text-red-500' : 'text-[#36c0c9]'}`}
                      />
                      <span>
                        Agent Recommendation: <strong>{recWord}</strong> •{' '}
                        <span className="font-medium">{confLevel} Confidence</span>
                      </span>
                    </span>
                  )
                })()}
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
                          <div className="text-xs font-semibold text-[#0d212c]">
                            {stage.title.replace(/^\d+[\.\s]+/, '')}
                          </div>
                          <div
                            className={`text-[11px] font-medium mt-0.5 ${
                              isInProgress ? 'text-[#36c0c9] font-medium' : 'text-[#64748b]'
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
              <h2 className="text-base font-semibold text-[#0d212c]">Solution Overview</h2>
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
                    className="px-3 py-1 rounded-xl bg-[#f0fdfa] text-[#0f766e] text-xs font-medium border border-[#ccfbf1]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-[1px] bg-[#f1f5f9] w-full" />

            {/* Section 3: Key Information */}
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-[#0d212c]">Key Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Focus Area */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
                    <Target className="w-4 h-4 text-[#36c0c9]" />
                    <span>Focus Area(s)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f0fdfa] text-[#0f766e] text-xs font-medium border border-[#ccfbf1]">
                      {request.focusArea}
                    </span>
                  </div>
                </div>

                {/* Solution Maturity */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
                    <BarChart2 className="w-4 h-4 text-[#36c0c9]" />
                    <span>Solution Maturity</span>
                  </div>
                  <div>
                    <span className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                      {request.solutionMaturity}
                    </span>
                  </div>
                </div>

                {/* Regulatory Approvals */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
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
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
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
                        className="px-2.5 py-0.5 rounded-lg bg-white text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {pop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Area(s) */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
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
                        className="px-2.5 py-0.5 rounded-lg bg-white text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Development Approach */}
                <div className="p-4 rounded-xl border border-[#e2e8f0] bg-slate-50/40 flex flex-col gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0d212c]">
                    <Link2 className="w-4 h-4 text-[#36c0c9]" />
                    <span>Development Approach</span>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 text-xs font-medium border border-slate-200">
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
                <h2 className="text-base sm:text-lg font-semibold text-[#0d212c]">
                  Partnership Brief Review
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Detailed supplier submission and responses for clinical and technical evaluation.
                </p>
              </div>

              {/* Proceed and Reject Buttons displayed on the Partnership Brief tab — Director only */}
              {!isNonDirector && (
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDecisionError(null)
                      setShowProceedModal(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
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
                    className="px-4 py-2 rounded-lg bg-white border border-red-500 text-red-600 hover:bg-red-50 font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
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
                          ? 'bg-white text-[#36c0c9] font-semibold shadow-2xs border-l-3 border-[#36c0c9]'
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      1. Company Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                    <div>
                      <div className="text-xs font-medium text-[#64748b]">
                        Company Name <span className="text-red-500 font-semibold">*</span>
                      </div>
                      <div className="text-sm font-medium text-[#0d212c] mt-1">
                        {request.companyInfo.company}
                      </div>
                    </div>

                    {!isNonDirector && (
                      <>
                        <div>
                          <div className="text-xs font-medium text-[#64748b]">
                            Contact Person Name{' '}
                            <span className="text-red-500 font-semibold">*</span>
                          </div>
                          <div className="text-sm font-medium text-[#0d212c] mt-1">
                            {request.companyInfo.name}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-[#64748b]">
                            Job Title <span className="text-red-500 font-semibold">*</span>
                          </div>
                          <div className="text-sm font-medium text-[#0d212c] mt-1">
                            {request.companyInfo.jobTitle}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-[#64748b]">
                            Email Address <span className="text-red-500 font-semibold">*</span>
                          </div>
                          <div className="text-sm font-medium text-[#0d212c] mt-1">
                            {request.companyInfo.email}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-[#64748b]">Phone Number</div>
                          <div className="text-sm font-medium text-[#0d212c] mt-1">
                            {request.companyInfo.phoneNumber || 'Not provided'}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <div className="text-xs font-medium text-[#64748b]">
                        Year Company Was Founded{' '}
                        <span className="text-red-500 font-semibold">*</span>
                      </div>
                      <div className="text-sm font-medium text-[#0d212c] mt-1">
                        {request.companyInfo.yearFounded}
                      </div>
                    </div>

                    {!isNonDirector && (
                      <div>
                        <div className="text-xs font-medium text-[#64748b]">Referred By</div>
                        <div className="text-sm font-medium text-[#0d212c] mt-1">
                          {request.referredBy || '—'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Company's Stage of Maturity and Experience */}
                <div id="company-experience" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      2. Company&apos;s Stage of Maturity and Experience
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#475569] leading-relaxed">
                    <p>{request.assessmentAreas.stageOfMaturityAndExperience}</p>

                    <div>
                      <div className="font-semibold text-[#0d212c] mb-2">
                        Key milestones include:
                      </div>
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      3. Proposal of Collaboration
                    </h3>
                  </div>

                  <div className="text-xs sm:text-sm text-[#475569] leading-relaxed flex flex-col gap-3">
                    <p>{request.assessmentAreas.proposalOfCollaboration}</p>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-semibold text-[#0d212c] mb-1">
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      4. Focus Area(s) <span className="text-red-500 font-semibold">*</span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {request.assessmentAreas.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#f0fdfa] text-[#0f766e] text-xs font-medium border border-[#ccfbf1]"
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      5. Solution Maturity &amp; Regulatory Approvals
                    </h3>
                  </div>

                  <div className="text-xs sm:text-sm text-[#475569] leading-relaxed flex flex-col gap-3">
                    <p>{request.assessmentAreas.solutionMaturityLevelAndRegulatory}</p>
                    {request.assessmentAreas.relevantApprovals && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-semibold text-[#0d212c]">
                          Regulatory Clearances:{' '}
                        </span>
                        <span>{request.assessmentAreas.relevantApprovals}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Regulatory Approvals */}
                <div id="regulatory-approvals" className="py-8 scroll-mt-24 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#36c0c9]" />
                    <h3 className="text-base font-semibold text-[#0d212c]">
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
                        className={`px-3 py-1 rounded-xl text-xs font-medium border ${
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      7. Innovation &amp; Differentiation{' '}
                      <span className="text-red-500 font-semibold">*</span>
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      8. Development Approach
                    </h3>
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
                      9. Specific Resources &amp; Support from M42{' '}
                      <span className="text-red-500 font-semibold">*</span>
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
                    <h3 className="text-base font-semibold text-[#0d212c]">
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
                            className={`text-xs font-medium ${isChecked ? 'text-[#0d212c]' : 'text-slate-400'}`}
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

        {/* TAB: QUESTIONNAIRE (Internal Interest Profile) */}
        {isInternalTeam && activeTab === 'questionnaire' && (
          <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-[#0d212c]">
                Internal Evaluation Questionnaire
              </h2>
              <p className="text-xs text-[#64748b]">
                Complete the questions below to evaluate clinical need, pilot sponsorship, and
                strategic feasibility.
              </p>
            </div>

            {questionnaireSubmitted ? (
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-xs flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f0fdfa] text-[#0f766e] flex items-center justify-center border border-[#ccfbf1]">
                  <CheckCircle2 className="w-6 h-6 text-[#0f766e]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0d212c]">
                    Questionnaire Submitted Successfully
                  </h3>
                  <p className="text-xs text-[#64748b] mt-1 max-w-md">
                    Your evaluation and value &amp; need statement have been recorded and shared
                    with the clinical partnership committee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestionnaireSubmitted(false)}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-[#008a8a] border border-[#36c0c9]/40 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  Edit Answers
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Questions Container (Matching design from Image 1) */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col divide-y divide-[#f1f5f9]">
                  {/* Question 1 */}
                  <div className="pb-8 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        1
                      </div>
                      <label
                        htmlFor="q1-problem"
                        className="text-sm font-medium text-[#0d212c] leading-relaxed"
                      >
                        Is this a real problem for you today, and what do you do about it now?
                      </label>
                    </div>
                    <textarea
                      id="q1-problem"
                      rows={4}
                      value={q1Problem}
                      onChange={(e) => setQ1Problem(e.target.value)}
                      placeholder="Describe the current clinical or operational problem and existing workarounds..."
                      className="w-full p-3.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white transition leading-relaxed"
                    />
                  </div>

                  {/* Question 2 */}
                  <div className="py-8 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        2
                      </div>
                      <span className="text-sm font-medium text-[#0d212c] leading-relaxed">
                        Which KPI would move, what is the baseline today, and what change would
                        matter?
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#0d212c]">KPI</label>
                        <select
                          value={q2Kpi}
                          onChange={(e) => setQ2Kpi(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                        >
                          <option value="">Choose a KPI</option>
                          <option value="ICU sepsis mortality">ICU sepsis mortality</option>
                          <option value="30-day readmission rate">30-day readmission rate</option>
                          <option value="Time to antibiotic therapy">
                            Time to antibiotic therapy
                          </option>
                          <option value="Average length of stay (ALOS)">
                            Average length of stay (ALOS)
                          </option>
                          <option value="Bed occupancy rate">Bed occupancy rate</option>
                          <option value="Emergency department wait time">
                            Emergency department wait time
                          </option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#0d212c]">
                          Baseline today
                        </label>
                        <input
                          type="text"
                          value={q2Baseline}
                          onChange={(e) => setQ2Baseline(e.target.value)}
                          placeholder="e.g. 21% over 12 months"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#0d212c]">
                        Change that would matter
                      </label>
                      <input
                        type="text"
                        value={q2Change}
                        onChange={(e) => setQ2Change(e.target.value)}
                        placeholder="e.g. 3 points lower in 12 months"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                      />
                    </div>
                  </div>

                  {/* Question 3 */}
                  <div className="py-8 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        3
                      </div>
                      <span className="text-sm font-medium text-[#0d212c] leading-relaxed">
                        Would you sponsor a pilot, who would the named sponsor be, and what capacity
                        can you commit?
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {['Yes, we would sponsor', 'No', 'Not sure yet'].map((opt) => {
                        const isSelected = q3Sponsor === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQ3Sponsor(opt)}
                            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition text-xs sm:text-sm font-medium cursor-pointer ${
                              isSelected
                                ? 'bg-slate-50 border-[#0d212c] text-[#0d212c] ring-1 ring-[#0d212c]'
                                : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#0d212c] bg-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <span className="w-2 h-2 rounded-full bg-[#0d212c]" />}
                            </span>
                            <span>{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Question 4 */}
                  <div className="py-8 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        4
                      </div>
                      <span className="text-sm font-medium text-[#0d212c] leading-relaxed">
                        Is there a budget line, or would it need central funding?
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {['Existing budget line', 'Needs central funding', "Don't know"].map(
                        (opt) => {
                          const isSelected = q4Budget === opt
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setQ4Budget(opt)}
                              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition text-xs sm:text-sm font-medium cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-50 border-[#0d212c] text-[#0d212c] ring-1 ring-[#0d212c]'
                                  : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-slate-50'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#0d212c] bg-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-[#0d212c]" />
                                )}
                              </span>
                              <span>{opt}</span>
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>

                  {/* Question 5 */}
                  <div className="pt-8 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                        5
                      </div>
                      <label
                        htmlFor="q5-sayno"
                        className="text-sm font-medium text-[#0d212c] leading-relaxed"
                      >
                        What would make you say no?
                      </label>
                    </div>
                    <textarea
                      id="q5-sayno"
                      rows={4}
                      value={q5SayNo}
                      onChange={(e) => setQ5SayNo(e.target.value)}
                      placeholder="Identify dealbreakers, clinical blockers, integration risks, or IT hurdles..."
                      className="w-full p-3.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white transition leading-relaxed"
                    />
                  </div>
                </div>

                {/* AI-GENERATED VALUE AND NEED STATEMENT (Shown when questions are answered - Matching Image 2) */}
                {allQuestionsAnswered && (
                  <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                    {/* Value and need statement card */}
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs flex flex-col gap-5">
                      <h3 className="text-base font-semibold text-[#0d212c]">
                        Value and need statement
                      </h3>

                      {/* Cyan callout block with dark teal left border */}
                      <div className="p-4 sm:p-5 rounded-xl bg-[#f0f9fa] border-l-4 border-[#0e7490] text-xs sm:text-sm text-[#0f172a] leading-relaxed font-normal">
                        {dynamicAiStatement}
                      </div>

                      {/* KPI / Baseline / Change summary table */}
                      <div className="bg-slate-50/70 border border-[#e2e8f0] rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-semibold uppercase tracking-wider">
                              <th className="py-2.5 px-4">KPI</th>
                              <th className="py-2.5 px-4">BASELINE</th>
                              <th className="py-2.5 px-4">CHANGE THAT WOULD MATTER</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-3 px-4 font-medium text-[#0d212c]">
                                {q2Kpi || 'ICU sepsis mortality'}
                              </td>
                              <td className="py-3 px-4 text-[#475569]">
                                {q2Baseline || '21% over 12 months'}
                              </td>
                              <td className="py-3 px-4 text-[#475569]">
                                {q2Change || '3 points lower in 12 months'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom Alignment & Send Card (Image 2 bottom box) */}
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAiStatementChoice('yes')}
                          className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition text-xs sm:text-sm font-medium cursor-pointer ${
                            aiStatementChoice === 'yes'
                              ? 'bg-slate-50 border-[#0d212c] text-[#0d212c] ring-1 ring-[#0d212c]'
                              : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              aiStatementChoice === 'yes'
                                ? 'border-[#0d212c] bg-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {aiStatementChoice === 'yes' && (
                              <span className="w-2 h-2 rounded-full bg-[#0d212c]" />
                            )}
                          </span>
                          <span>Yes, this is right</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAiStatementChoice('change')}
                          className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition text-xs sm:text-sm font-medium cursor-pointer ${
                            aiStatementChoice === 'change'
                              ? 'bg-slate-50 border-[#0d212c] text-[#0d212c] ring-1 ring-[#0d212c]'
                              : 'bg-white border-[#e2e8f0] text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              aiStatementChoice === 'change'
                                ? 'border-[#0d212c] bg-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {aiStatementChoice === 'change' && (
                              <span className="w-2 h-2 rounded-full bg-[#0d212c]" />
                            )}
                          </span>
                          <span>Something needs changing</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendQuestionnaire}
                        className="px-8 py-2.5 rounded-full bg-[#0e5c68] hover:bg-[#0b4b55] text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer shrink-0 self-end sm:self-auto"
                      >
                        Send
                      </button>
                    </div>

                    {/* If user selected "Something needs changing", let them write their own */}
                    {aiStatementChoice === 'change' && (
                      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sm:p-6 shadow-xs flex flex-col gap-2 animate-in fade-in">
                        <label className="text-xs font-semibold text-[#0d212c]">
                          Provide your updated Value and Need Statement
                        </label>
                        <textarea
                          rows={3}
                          value={customStatement}
                          onChange={(e) => setCustomStatement(e.target.value)}
                          placeholder="Write your customized statement here..."
                          className="w-full p-3.5 rounded-xl border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white transition leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERNAL REVIEW (2 tables: Internal Interest & Strategy Team) */}
        {!isNonDirector &&
          (activeTab === 'internal_review' || activeTab === 'internal_interest') && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
              {/* Header: Title reduced by 2 units and reduced subtitle */}
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-[#0d212c]">Review &amp; Alignment</h2>
                <p className="text-xs text-[#64748b]">
                  Send requests to internal stakeholders and strategy team to review this
                  partnership in sequence.
                </p>
              </div>

              {/* STEP 1: Internal Interest (No outer bounding box) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#36c0c9] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
                      1
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0d212c]">
                      Internal Interest
                    </h3>
                    {/* Subheading data in custom tooltip via i button */}
                    <div className="relative group inline-flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center"
                        aria-label="Info"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl text-center">
                        Select up to 5 internal stakeholders to request their interest in this
                        partnership.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d212c]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowQuestionnaireModal(true)}
                      className="text-xs sm:text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer shrink-0 bg-transparent active:bg-transparent focus:outline-none"
                    >
                      View Questionnaire
                    </button>
                    {!internalRequestSent && (
                      <button
                        type="button"
                        disabled={stakeholders.length === 0}
                        onClick={() => setShowSendInternalModal(true)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition shrink-0 ${
                          stakeholders.length === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                        }`}
                      >
                        Send Request
                      </button>
                    )}
                  </div>
                </div>

                {/* Table 1: Internal Interest Stakeholders */}
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-medium uppercase tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          {internalRequestSent ? (
                            <>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Deadline</th>
                              <th className="py-3 px-4">Decision</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="py-3 px-4">Recommended</th>
                              <th className="py-3 px-4">Expertise</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {stakeholders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#64748b]">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="w-6 h-6 text-slate-300" />
                                <div className="text-xs font-medium text-[#0d212c]">
                                  No respondents added yet
                                </div>
                                <div className="text-xs text-[#64748b]">
                                  Click &quot;+ Add Respondant&quot; to assign review team members.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          stakeholders.map((person, idx) => (
                            <tr key={person.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                                    style={{
                                      backgroundColor: person.avatarColorBg,
                                      color: person.avatarColorText,
                                    }}
                                  >
                                    {person.initials}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs sm:text-sm font-semibold text-[#0d212c] truncate">
                                      {person.name}
                                    </span>
                                    <span className="text-[11px] font-medium text-[#64748b] truncate">
                                      {person.role}
                                      {person.department ? ` • ${person.department}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {internalRequestSent ? (
                                <>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {renderRequestStatusBadge(
                                      person.status ||
                                        (idx === 0
                                          ? 'Completed'
                                          : idx === 1
                                            ? 'In Progress'
                                            : 'Pending')
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className="text-xs sm:text-[13px] font-medium text-[#0d212c]">
                                      {person.deadline || '5 days'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {renderDecisionBadge(
                                      person.decision !== undefined
                                        ? person.decision
                                        : idx === 0
                                          ? 'Proceed'
                                          : '-'
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {person.source === 'manual' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        <UserPlus className="w-3 h-3 text-slate-500" />
                                        <span>Manually Added</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1]">
                                        <Sparkles className="w-3 h-3 text-[#0f766e]" />
                                        <span>AI Recommended</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setViewingResponseMember(person)}
                                      title="View member response"
                                      aria-label="View member response"
                                      className="p-1.5 text-slate-500 hover:text-[#008a8a] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3.5 px-4 text-xs text-[#0d212c] max-w-sm">
                                    <span className="text-[#334155] leading-relaxed">
                                      {person.whySuggested ||
                                        'Selected based on clinical domain expertise and alignment.'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-xs text-[#475569] whitespace-nowrap">
                                    <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-normal">
                                      {person.expertise}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {person.source === 'manual' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        <UserPlus className="w-3 h-3 text-slate-500" />
                                        <span>Manually Added</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1]">
                                        <Sparkles className="w-3 h-3 text-[#0f766e]" />
                                        <span>AI Recommended</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setViewingResponseMember(person)}
                                        title="View member response"
                                        aria-label="View member response"
                                        className="p-1.5 text-slate-500 hover:text-[#008a8a] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeleteStakeholder(person)}
                                        title="Delete respondent"
                                        aria-label="Delete respondent"
                                        className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
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

                {/* Table 1 Bottom Actions (hidden when request is sent) */}
                {!internalRequestSent && (
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <div className="relative group inline-block shrink-0">
                      <button
                        type="button"
                        disabled={stakeholders.length >= 5}
                        onClick={handleOpenAddStakeholder}
                        className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition ${
                          stakeholders.length >= 5
                            ? 'border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'
                            : 'border border-[#cbd5e1] bg-white text-[#0d212c] hover:bg-slate-50 hover:border-slate-400 cursor-pointer'
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Respondant</span>
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-2 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl text-center">
                        {stakeholders.length >= 5
                          ? 'Maximum 5 respondents reached'
                          : 'Add up to 5 respondents'}
                        <div className="absolute bottom-full left-4 border-4 border-transparent border-b-[#0d212c]" />
                      </div>
                    </div>
                    <span className="text-xs text-[#64748b]">You can add up to 5 respondents.</span>
                  </div>
                )}
              </div>

              {/* Horizontal Line Separator */}
              <div className="h-[1px] bg-[#e2e8f0] w-full my-4" />

              {/* STEP 2: Strategy Team (No outer bounding box, shows only 1 person by default) */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#36c0c9] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
                      2
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0d212c]">
                      Strategy Team
                    </h3>
                    {/* Subheading data in custom tooltip via i button */}
                    <div className="relative group inline-flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center"
                        aria-label="Info"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl text-center">
                        Select the strategy team members to review this partnership.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d212c]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowJudgementCriteriaModal(true)}
                      className="text-xs sm:text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer shrink-0 bg-transparent active:bg-transparent focus:outline-none"
                    >
                      View Evaluation Criteria
                    </button>
                    {!strategyRequestSent && (
                      <button
                        type="button"
                        disabled={strategyMembers.length === 0}
                        onClick={() => setShowSendStrategyModal(true)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition shrink-0 ${
                          strategyMembers.length === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                        }`}
                      >
                        Send Request
                      </button>
                    )}
                  </div>
                </div>

                {/* Table 2: Strategy Team Members */}
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] text-[11px] font-medium uppercase tracking-wider">
                          <th className="py-3 px-4">Name</th>
                          {strategyRequestSent ? (
                            <>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Deadline</th>
                              <th className="py-3 px-4">Decision</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="py-3 px-4">Recommended</th>
                              <th className="py-3 px-4">Expertise</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0]">
                        {strategyMembers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#64748b]">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="w-6 h-6 text-slate-300" />
                                <div className="text-xs font-medium text-[#0d212c]">
                                  No strategy members added yet
                                </div>
                                <div className="text-xs text-[#64748b]">
                                  Click &quot;+ Add Member&quot; to assign strategy reviewers.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          strategyMembers.map((person) => (
                            <tr key={person.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                                    style={{
                                      backgroundColor: person.avatarColorBg,
                                      color: person.avatarColorText,
                                    }}
                                  >
                                    {person.initials}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs sm:text-sm font-semibold text-[#0d212c] truncate">
                                      {person.name}
                                    </span>
                                    <span className="text-[11px] font-medium text-[#64748b] truncate">
                                      {person.role}
                                      {person.department ? ` • ${person.department}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {strategyRequestSent ? (
                                <>
                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {renderRequestStatusBadge(person.status || 'In Progress')}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    <span className="text-xs sm:text-[13px] font-medium text-[#0d212c]">
                                      {person.deadline || '2-3 days'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {renderDecisionBadge(person.decision)}
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {person.source === 'manual' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        <UserPlus className="w-3 h-3 text-slate-500" />
                                        <span>Manually Added</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1]">
                                        <Sparkles className="w-3 h-3 text-[#0f766e]" />
                                        <span>AI Recommended</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setViewingResponseMember(person)}
                                      title="View member response"
                                      aria-label="View member response"
                                      className="p-1.5 text-slate-500 hover:text-[#008a8a] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3.5 px-4 text-xs text-[#0d212c] max-w-sm">
                                    <span className="text-[#334155] leading-relaxed">
                                      {person.whySuggested ||
                                        'Selected based on market strategy alignment and expansion feasibility.'}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-xs text-[#475569] whitespace-nowrap">
                                    <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-normal">
                                      {person.expertise}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 whitespace-nowrap">
                                    {person.source === 'manual' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        <UserPlus className="w-3 h-3 text-slate-500" />
                                        <span>Manually Added</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1]">
                                        <Sparkles className="w-3 h-3 text-[#0f766e]" />
                                        <span>AI Recommended</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setViewingResponseMember(person)}
                                        title="View member response"
                                        aria-label="View member response"
                                        className="p-1.5 text-slate-500 hover:text-[#008a8a] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeleteStrategyMember(person)}
                                        title="Delete respondent"
                                        aria-label="Delete respondent"
                                        className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
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

                {/* Table 2 Bottom Actions (hidden when request is sent) */}
                {!strategyRequestSent && (
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <div className="relative group inline-block shrink-0">
                      <button
                        type="button"
                        disabled={strategyMembers.length >= 2}
                        onClick={handleOpenAddStrategyMember}
                        className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition ${
                          strategyMembers.length >= 2
                            ? 'border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'
                            : 'border border-[#cbd5e1] bg-white text-[#0d212c] hover:bg-slate-50 hover:border-slate-400 cursor-pointer'
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Member</span>
                      </button>
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-2 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl text-center">
                        {strategyMembers.length >= 2
                          ? 'Maximum 2 members reached'
                          : 'Add up to 2 members'}
                        <div className="absolute bottom-full left-4 border-4 border-transparent border-b-[#0d212c]" />
                      </div>
                    </div>
                    <span className="text-xs text-[#64748b]">You can add up to 2 members.</span>
                  </div>
                )}
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
                  <h3 className="text-lg font-semibold text-[#0d212c]">Proceed to Next Stage</h3>
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
              <label htmlFor="proceed-reason" className="text-xs font-medium text-[#0d212c]">
                Note
              </label>
              <textarea
                id="proceed-reason"
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Add director evaluation feedback or next steps..."
                className="w-full p-3 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowProceedModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onProceed?.(request.id, decisionReason.trim())
                  setShowProceedModal(false)
                  setActiveTab('internal_review')
                }}
                className="px-5 py-2.5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
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
                  <h3 className="text-lg font-semibold text-[#0d212c]">
                    Reject Partnership Request
                  </h3>
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
              <div className="flex items-center gap-1.5">
                <label htmlFor="reject-reason" className="text-xs font-medium text-[#0d212c]">
                  Note <span className="text-red-500 font-semibold">*</span>
                </label>
                <div className="relative group inline-flex items-center">
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Rejection note info"
                    className="flex items-center justify-center cursor-default outline-none text-slate-400 select-none"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 w-64 p-2.5 bg-[#0d212c] text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-xl text-center">
                    Mention the reason why you disagree with agent&apos;s decision.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d212c]" />
                  </div>
                </div>
              </div>
              <textarea
                id="reject-reason"
                rows={3}
                value={decisionReason}
                onChange={(e) => {
                  setDecisionReason(e.target.value)
                  if (decisionError) setDecisionError(null)
                }}
                placeholder="Provide clear rationale for rejecting this partnership request..."
                className="w-full p-3 rounded-lg border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white"
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
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
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
                  setActiveTab('internal_review')
                }}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD RESPONDANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#0d212c]">Add Respondant</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Assign an internal team member to review this partnership request.
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

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Select Team Member <span className="text-red-500 font-semibold">*</span>
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => {
                    const candId = e.target.value
                    setSelectedCandidateId(candId)
                    const found = CANDIDATE_DIRECTORY.find((c) => c.id === candId)
                    if (found) {
                      setNewRole(found.role)
                      setNewDepartment(found.department)
                      setNewExpertise(found.expertise)
                    } else {
                      setNewRole('')
                      setNewDepartment('')
                      setNewExpertise('')
                    }
                    if (formError) setFormError(null)
                  }}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                >
                  <option value="">-- Choose team member --</option>
                  {CANDIDATE_DIRECTORY.filter(
                    (c) => !stakeholders.some((s) => s.name === c.name)
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dedicated Input Field: Role */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Role <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => {
                    setNewRole(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="e.g. Chief Medical Officer"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              {/* Dedicated Input Field: Department */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Department <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => {
                    setNewDepartment(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="e.g. Clinical Governance"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              {/* Dedicated Input Field: Domain Expertise */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Domain Expertise <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => {
                    setNewExpertise(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="e.g. Clinical Governance & Safety"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Why you choose them <span className="text-red-500 font-semibold">*</span>
                </label>
                <textarea
                  rows={3}
                  value={whyChosen}
                  onChange={(e) => {
                    setWhyChosen(e.target.value)
                    if (formError) setFormError(null)
                  }}
                  placeholder="Enter reason why you choose this respondent..."
                  className="w-full mt-1 p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !selectedCandidateId ||
                  !newRole.trim() ||
                  !newDepartment.trim() ||
                  !newExpertise.trim() ||
                  !whyChosen.trim()
                }
                onClick={handleSaveAddStakeholder}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                  !selectedCandidateId ||
                  !newRole.trim() ||
                  !newDepartment.trim() ||
                  !newExpertise.trim() ||
                  !whyChosen.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                }`}
              >
                Add Respondant
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
              <h3 className="text-lg font-semibold text-[#0d212c]">Remove Respondent</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-[#0d212c]">{deletingStakeholder.name}</strong> from the
                internal review panel?
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full text-left">
              <label
                htmlFor="delete-stakeholder-note"
                className="text-xs font-medium text-[#0d212c]"
              >
                Note
              </label>
              <textarea
                id="delete-stakeholder-note"
                rows={2}
                value={deleteNote}
                onChange={(e) => setDeleteNote(e.target.value)}
                placeholder="Mention note for removing respondent..."
                className="w-full p-2.5 rounded-xl border border-[#e2e8f0] text-xs text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white"
              />
            </div>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                onClick={() => {
                  setDeletingStakeholder(null)
                  setDeleteNote('')
                }}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 transition cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStakeholder}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex-1"
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
              <h3 className="text-lg font-semibold text-[#0d212c]">Maximum Limit Reached</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                You can add up to 5 internal stakeholders per partnership request. Please edit or
                remove an existing stakeholder to add another.
              </p>
            </div>
            <div className="w-full mt-2">
              <button
                onClick={() => setMaxLimitWarning(false)}
                className="w-full px-5 py-2.5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND INTERNAL INTEREST REQUESTS POPUP MODAL */}
      {showSendInternalModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header: Subheading removed */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#36c0c9]/10 text-[#36c0c9] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d212c]">
                    Send Internal Interest Requests
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSendInternalModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Respondants list (No scroll) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#0d212c]">
                Selected Respondants ({selectedInternalSendIds.length})
              </label>
              <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
                {stakeholders.map((person) => {
                  const isChecked = selectedInternalSendIds.includes(person.id)
                  return (
                    <div
                      key={person.id}
                      onClick={() => toggleInternalSendMember(person.id)}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked
                              ? 'bg-[#36c0c9] border-[#36c0c9] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
                          style={{
                            backgroundColor: person.avatarColorBg,
                            color: person.avatarColorText,
                          }}
                        >
                          {person.initials}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-[#0d212c] truncate">
                          {person.name}
                        </span>
                      </div>
                      <span className="text-xs font-normal text-[#64748b] shrink-0 pl-2">
                        {person.expertise}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#0d212c]">Note</label>
              <textarea
                rows={4}
                value={internalSendNote}
                onChange={(e) => setInternalSendNote(e.target.value)}
                placeholder="Enter note for stakeholders..."
                className="w-full p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white leading-relaxed"
              />
            </div>

            {/* Response due (strictly non-editable) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-medium text-[#0d212c]">Response due</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] bg-slate-50 text-xs sm:text-sm font-medium text-[#0d212c] select-none">
                <Calendar className="w-4 h-4 text-[#64748b]" />
                <span>5 business days</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowSendInternalModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedInternalSendIds.length === 0}
                onClick={() => {
                  setShowSendInternalModal(false)
                  setInternalRequestSent(true)
                  setReviewToast('Review requests sent successfully to selected stakeholders.')
                }}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                  selectedInternalSendIds.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                }`}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND STRATEGY TEAM REVIEW REQUESTS POPUP MODAL */}
      {showSendStrategyModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header: Subheading removed */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#36c0c9]/10 text-[#36c0c9] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d212c]">
                    Send Strategy Review Requests
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSendStrategyModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Respondants list (No scroll) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#0d212c]">
                Selected Respondants ({selectedStrategySendIds.length})
              </label>
              <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
                {strategyMembers.map((person) => {
                  const isChecked = selectedStrategySendIds.includes(person.id)
                  return (
                    <div
                      key={person.id}
                      onClick={() => toggleStrategySendMember(person.id)}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isChecked
                              ? 'bg-[#36c0c9] border-[#36c0c9] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
                          style={{
                            backgroundColor: person.avatarColorBg,
                            color: person.avatarColorText,
                          }}
                        >
                          {person.initials}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-[#0d212c] truncate">
                          {person.name}
                        </span>
                      </div>
                      <span className="text-xs font-normal text-[#64748b] shrink-0 pl-2">
                        {person.expertise}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#0d212c]">Note</label>
              <textarea
                rows={4}
                value={strategySendNote}
                onChange={(e) => setStrategySendNote(e.target.value)}
                placeholder="Enter note for strategy team..."
                className="w-full p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white leading-relaxed"
              />
            </div>

            {/* Response due: strictly non-editable, 2-4 working days for strategy team */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-medium text-[#0d212c]">Response due</label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] bg-slate-50 text-xs sm:text-sm font-medium text-[#0d212c] select-none">
                <Calendar className="w-4 h-4 text-[#64748b]" />
                <span>2-4 working days</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowSendStrategyModal(false)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedStrategySendIds.length === 0}
                onClick={() => {
                  setShowSendStrategyModal(false)
                  setStrategyRequestSent(true)
                  setReviewToast('Strategy review requests sent successfully to selected members.')
                }}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                  selectedStrategySendIds.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                }`}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STRATEGY TEAM MEMBER MODAL */}
      {isAddStrategyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#0d212c]">Add Team Member</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Assign a strategy team member to evaluate this partnership.
                </p>
              </div>
              <button
                onClick={() => setIsAddStrategyModalOpen(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {strategyFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{strategyFormError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Select Team Member <span className="text-red-500 font-semibold">*</span>
                </label>
                <select
                  value={selectedStrategyCandId}
                  onChange={(e) => {
                    const candId = e.target.value
                    setSelectedStrategyCandId(candId)
                    const found = STRATEGY_CANDIDATE_DIRECTORY.find((c) => c.id === candId)
                    if (found) {
                      setNewStrategyRole(found.role)
                      setNewStrategyDepartment(found.department)
                      setNewStrategyExpertise(found.expertise)
                    } else {
                      setNewStrategyRole('')
                      setNewStrategyDepartment('')
                      setNewStrategyExpertise('')
                    }
                    if (strategyFormError) setStrategyFormError(null)
                  }}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition cursor-pointer"
                >
                  <option value="">-- Choose strategy team member --</option>
                  {STRATEGY_CANDIDATE_DIRECTORY.filter(
                    (c) => !strategyMembers.some((s) => s.name === c.name)
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dedicated Input Field: Role */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Role <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newStrategyRole}
                  onChange={(e) => {
                    setNewStrategyRole(e.target.value)
                    if (strategyFormError) setStrategyFormError(null)
                  }}
                  placeholder="e.g. Senior Strategy Manager"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              {/* Dedicated Input Field: Department */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Department <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newStrategyDepartment}
                  onChange={(e) => {
                    setNewStrategyDepartment(e.target.value)
                    if (strategyFormError) setStrategyFormError(null)
                  }}
                  placeholder="e.g. Strategy &amp; Investments"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              {/* Dedicated Input Field: Domain Expertise */}
              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Domain Expertise <span className="text-red-500 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  value={newStrategyExpertise}
                  onChange={(e) => {
                    setNewStrategyExpertise(e.target.value)
                    if (strategyFormError) setStrategyFormError(null)
                  }}
                  placeholder="e.g. Market Strategy &amp; Scalability"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#0d212c]">
                  Why you choose them <span className="text-red-500 font-semibold">*</span>
                </label>
                <textarea
                  rows={3}
                  value={whyStrategyChosen}
                  onChange={(e) => {
                    setWhyStrategyChosen(e.target.value)
                    if (strategyFormError) setStrategyFormError(null)
                  }}
                  placeholder="Enter reason why you choose this member..."
                  className="w-full mt-1 p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsAddStrategyModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !selectedStrategyCandId ||
                  !newStrategyRole.trim() ||
                  !newStrategyDepartment.trim() ||
                  !newStrategyExpertise.trim() ||
                  !whyStrategyChosen.trim()
                }
                onClick={handleSaveAddStrategyMember}
                className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                  !selectedStrategyCandId ||
                  !newStrategyRole.trim() ||
                  !newStrategyDepartment.trim() ||
                  !newStrategyExpertise.trim() ||
                  !whyStrategyChosen.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                }`}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STRATEGY MEMBER CONFIRMATION MODAL */}
      {deletingStrategyMember && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setDeletingStrategyMember(null)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0d212c]">Remove Strategy Member</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                Are you sure you want to remove{' '}
                <strong className="text-[#0d212c]">{deletingStrategyMember.name}</strong> from the
                strategy review team?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeletingStrategyMember(null)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 transition cursor-pointer flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStrategyMember}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAX STRATEGY LIMIT WARNING MODAL */}
      {maxStrategyLimitWarning && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setMaxStrategyLimitWarning(false)}
              className="absolute top-5 right-5 text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0d212c]">Maximum Limit Reached</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                You can add up to 2 strategy team members per partnership request. Please remove an
                existing member to add another.
              </p>
            </div>
            <div className="w-full mt-2">
              <button
                onClick={() => setMaxStrategyLimitWarning(false)}
                className="w-full px-5 py-2.5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW QUESTIONNAIRE POPUP MODAL (Internal Interest) */}
      {showQuestionnaireModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-xl sm:max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-[#e2e8f0] flex flex-col gap-4 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-base sm:text-lg font-semibold text-[#0d212c]">
                View Questionnaire
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionnaireModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close questionnaire modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list (view-only list of questions, no option to answer) */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5 flex flex-col divide-y divide-[#f1f5f9]">
              {[
                'Is this a real problem for you today, and what do you do about it now?',
                'Which KPI would move, what is the baseline today, and what change would matter?',
                'Would you sponsor a pilot, who would the named sponsor be, and what capacity can you commit?',
                'Is there a budget line, or would it need central funding?',
                'What would make you say no?',
              ].map((question, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-[13px] font-normal text-[#0d212c] leading-relaxed">
                    {question}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowQuestionnaireModal(false)}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW EVALUATION CRITERIA POPUP MODAL (Strategy Team) */}
      {showJudgementCriteriaModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-xl sm:max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-[#e2e8f0] flex flex-col gap-4 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <h3 className="text-base sm:text-lg font-semibold text-[#0d212c]">
                Evaluation Criteria
              </h3>
              <button
                type="button"
                onClick={() => setShowJudgementCriteriaModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close evaluation criteria modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of 7 evaluation criteria (no agent data, no dropdown input fields, only data visible) */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white divide-y divide-[#f1f5f9] overflow-hidden">
              {[
                {
                  title: 'Fit to current focus areas',
                  value: 'In scope',
                },
                {
                  title: 'Duplication on the roadmap',
                  value: 'Overlaps a roadmap item',
                },
                {
                  title: 'Build, buy or partner',
                  value: 'Build',
                },
                {
                  title: 'Architecture, hosting and data residency',
                  value: 'Does not fit',
                },
                {
                  title: 'Own versus rent',
                  value: 'Mixed',
                },
                {
                  title: 'Scale across the network',
                  value: 'High',
                },
                {
                  title: 'Sovereignty and local content',
                  value: 'Partly meets',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 sm:py-3"
                >
                  <span className="text-xs sm:text-[13px] font-medium text-slate-700">
                    {item.title}
                  </span>
                  <span className="text-xs font-medium text-[#0d212c] sm:text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowJudgementCriteriaModal(false)}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MEMBER RESPONSE POPUP MODAL */}
      {viewingResponseMember && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-xl sm:max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                  style={{
                    backgroundColor: viewingResponseMember.avatarColorBg,
                    color: viewingResponseMember.avatarColorText,
                  }}
                >
                  {viewingResponseMember.initials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-[#0d212c]">
                      {viewingResponseMember.name}
                    </h3>
                    {viewingResponseMember.source === 'manual' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <UserPlus className="w-3 h-3 text-slate-500" />
                        <span>Manually Added</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f0fdfa] text-[#0f766e] border border-[#ccfbf1]">
                        <Sparkles className="w-3 h-3 text-[#0f766e]" />
                        <span>AI Recommended</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#64748b]">
                    {viewingResponseMember.role}
                    {viewingResponseMember.department
                      ? ` • ${viewingResponseMember.department}`
                      : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingResponseMember(null)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Response Content or Empty State */}
            {viewingResponseMember.response ? (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    1. Problem &amp; Workaround
                  </span>
                  <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
                    {viewingResponseMember.response.problemAndCurrentApproach}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    2. Target KPI &amp; Impact
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">KPI</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.response.targetKpi}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Baseline</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.response.baselineToday}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Change That Matters</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.response.changeThatMatters}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#0d212c]">
                      3. Pilot Sponsorship
                    </span>
                    <span className="text-xs text-[#0f766e] font-medium bg-[#f0fdfa] border border-[#ccfbf1] px-2.5 py-1 rounded-lg w-fit">
                      {viewingResponseMember.response.sponsorPilot}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#0d212c]">4. Budget Line</span>
                    <span className="text-xs text-[#0d212c] font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                      {viewingResponseMember.response.budgetLine}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    5. What would make you say no?
                  </span>
                  <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
                    {viewingResponseMember.response.whatWouldMakeYouSayNo}
                  </p>
                </div>

                {viewingResponseMember.response.valueAndNeedStatement && (
                  <div className="p-4 rounded-xl bg-[#f0f9fa] border-l-4 border-[#0e7490] flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#0d212c]">
                      Value and Need Statement
                    </span>
                    <p className="text-xs sm:text-[13px] text-[#0f172a] leading-relaxed">
                      {viewingResponseMember.response.valueAndNeedStatement}
                    </p>
                  </div>
                )}
              </div>
            ) : viewingResponseMember.strategyResponse ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <span className="text-xs font-semibold text-[#0d212c]">
                    Strategy Review Assessment
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Strategic Alignment:</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.strategyResponse.strategicAlignment ||
                          'Strong Alignment'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Market Potential:</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.strategyResponse.marketPotential || 'High'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Recommendation:</span>
                      <span className="font-medium text-[#0f766e]">
                        {viewingResponseMember.strategyResponse.recommendation || 'Proceed'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Submitted:</span>
                      <span className="font-medium text-[#0d212c]">
                        {viewingResponseMember.strategyResponse.submittedAt || '1 day ago'}
                      </span>
                    </div>
                  </div>
                </div>

                {viewingResponseMember.strategyResponse.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#0d212c]">
                      Strategic Assessment Notes
                    </span>
                    <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
                      {viewingResponseMember.strategyResponse.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0d212c]">
                    No response submitted yet
                  </h4>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    This reviewer has not submitted their responses yet.
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setViewingResponseMember(null)}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {reviewToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-white border border-[#e2e8f0] text-sm font-medium flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          <span>{reviewToast}</span>
        </div>
      )}
    </div>
  )
}
