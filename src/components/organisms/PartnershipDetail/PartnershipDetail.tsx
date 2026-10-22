'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  Send,
  FileText,
  UserPlus,
  Clock,
  Eye,
} from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'
import {
  AgentActions,
  buildAdminAgentActions,
  buildAgentActions,
  getTypeConfidence,
} from '@/components/organisms/AgentActions'
import { AdminDecision } from '@/components/organisms/AdminDecision'
import { AnalysisDrawer } from '@/components/organisms/AnalysisDrawer'
import { RequestInfoModal } from '@/components/organisms/RequestInfoModal'
import { hasDirectorDecided, type AdminRouting } from '@/lib/caseActions'
import { AssessmentBrief } from '@/components/organisms/AssessmentBrief'
import { BriefDecision, type BriefDecisionChoice } from '@/components/organisms/BriefDecision'
import { ReviewersLoading } from '@/components/molecules/ReviewersLoading'
import { WorkflowStepper, type WorkflowStep } from '@/components/molecules/WorkflowStepper'
import { JudgementForm } from '@/components/organisms/JudgementForm'
import {
  QuestionnaireForm,
  type QuestionnaireValues,
} from '@/components/organisms/QuestionnaireForm'
import { VendorFormResponse } from '@/components/organisms/VendorFormResponse'
import {
  buildInitialJudgementEntries,
  buildStrategyDecisionDraft,
  isJudgementEdited,
  JUDGEMENT_CRITERIA,
  type JudgementEntries,
  type JudgementEntry,
  type StrategyDecision,
} from '@/types/judgementCriteria'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'
import {
  DEFAULT_INTERNAL_INTERESTS,
  DEFAULT_STRATEGY_MEMBERS,
  type InternalInterestStakeholder,
  type QuestionnaireResponse,
  type StrategyMemberResponse,
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

type StepId = 'brief' | 'alignment' | 'canvas' | 'approval' | 'questionnaire' | 'judgement'

const DEFAULT_QUESTIONNAIRE: QuestionnaireValues = {
  problem:
    'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics.',
  kpi: 'ICU sepsis mortality',
  baseline: '21% over 12 months',
  change: '3 points lower in 12 months',
  sponsor: 'Yes, we would sponsor',
  budget: 'Existing budget line',
  sayNo:
    'High latency in EHR synchronization or high false positive alarm fatigue among nursing staff.',
}

const questionnaireFromResponse = (r: QuestionnaireResponse): QuestionnaireValues => ({
  problem: r.problemAndCurrentApproach ?? '',
  kpi: r.targetKpi ?? '',
  baseline: r.baselineToday ?? '',
  change: r.changeThatMatters ?? '',
  sponsor: r.sponsorPilot ?? '',
  budget: r.budgetLine ?? '',
  sayNo: r.whatWouldMakeYouSayNo ?? '',
})

const judgementEntriesFromResponse = (r: StrategyMemberResponse): JudgementEntries => {
  const entries = buildInitialJudgementEntries()
  r.judgements?.forEach((j) => {
    entries[j.criterionId] = { value: j.value, reason: j.reason ?? '' }
  })
  return entries
}

export const PartnershipDetail: React.FC<PartnershipDetailProps> = ({
  request,
  onBack,
  onProceed,
  onReject,
  userProfile,
  allRequests = [],
  onRequestInfo,
  onResume,
  onRoute,
  animateAgentRun = true,
  className = '',
}) => {
  const isInternalTeam =
    userProfile?.id === 'evaluator' || userProfile?.roleTitle === 'Internal Interest Team'
  const isStrategyTeam =
    userProfile?.id === 'strategy-fit' || userProfile?.roleTitle === 'Strategy Team'
  const isNonDirector = isInternalTeam || isStrategyTeam
  const isAdmin = userProfile?.id === 'partnership-admin'
  const isDirector = !isNonDirector && !isAdmin

  // Delete note state
  const [deleteNote, setDeleteNote] = useState('')

  // View member response modal state
  const [viewingResponseMember, setViewingResponseMember] =
    useState<InternalInterestStakeholder | null>(null)

  // Questionnaire state for Internal Interest Team profile
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireValues>(DEFAULT_QUESTIONNAIRE)
  const [showQuestionnaireConfirmModal, setShowQuestionnaireConfirmModal] = useState(false)
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false)

  const patchQuestionnaire = (patch: Partial<QuestionnaireValues>) =>
    setQuestionnaire((prev) => ({ ...prev, ...patch }))

  const handleCancelQuestionnaire = () => setQuestionnaire(DEFAULT_QUESTIONNAIRE)

  const handleConfirmSubmitQuestionnaire = () => {
    const responsePayload: QuestionnaireResponse = {
      problemAndCurrentApproach: questionnaire.problem,
      targetKpi: questionnaire.kpi,
      baselineToday: questionnaire.baseline,
      changeThatMatters: questionnaire.change,
      sponsorPilot: questionnaire.sponsor,
      budgetLine: questionnaire.budget,
      whatWouldMakeYouSayNo: questionnaire.sayNo,
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
    setShowQuestionnaireConfirmModal(false)
    setQuestionnaireSubmitted(true)
    completeStep('questionnaire')
    setReviewToast('Questionnaire submitted successfully for Director Review.')
  }

  // Strategy Judgement state
  const [judgementEntries, setJudgementEntries] = useState<JudgementEntries>(
    buildInitialJudgementEntries
  )
  const [strategyDecision, setStrategyDecision] = useState<StrategyDecision | null>(null)
  const [strategyDecisionNote, setStrategyDecisionNote] = useState('')
  const [showStrategyConfirmModal, setShowStrategyConfirmModal] = useState(false)
  const [strategyJudgementSubmitted, setStrategyJudgementSubmitted] = useState(false)

  const handleJudgementEntryChange = (id: string, patch: Partial<JudgementEntry>) => {
    const criterion = JUDGEMENT_CRITERIA.find((c) => c.id === id)
    setJudgementEntries((prev) => {
      const next = { ...prev[id], ...patch }
      // Going back to the agent's pick means there is nothing to explain
      if (criterion && next.value === criterion.agentValue) next.reason = ''
      return { ...prev, [id]: next }
    })
  }

  const handleStrategyDecisionChange = (decision: StrategyDecision) => {
    setStrategyDecision(decision)
    setStrategyDecisionNote(buildStrategyDecisionDraft(decision, judgementEntries))
  }

  const editedJudgementCount = JUDGEMENT_CRITERIA.filter((c) =>
    isJudgementEdited(c, judgementEntries[c.id])
  ).length

  const handleConfirmSubmitStrategyJudgement = () => {
    setShowStrategyConfirmModal(false)
    setStrategyJudgementSubmitted(true)
    completeStep('judgement')
    setReviewToast('Strategy decision submitted successfully for Director Review.')
  }

  const [activeTab, setActiveTab] = useState<DetailTab>('review')

  // Review workflow: each step unlocks only after the one before it is completed
  const stepDefs: { id: StepId; label: string }[] = isInternalTeam
    ? [
        { id: 'brief', label: 'Initial Assessment Brief' },
        { id: 'questionnaire', label: 'Questionnaire' },
      ]
    : isStrategyTeam
      ? [
          { id: 'brief', label: 'Initial Assessment Brief' },
          { id: 'judgement', label: 'Judgement' },
        ]
      : isAdmin
        ? [{ id: 'brief', label: 'Initial Assessment Brief' }]
        : [
            { id: 'brief', label: 'Initial Assessment Brief' },
            { id: 'alignment', label: 'Strategic Alignment' },
            { id: 'canvas', label: 'Internal Canvas' },
            { id: 'approval', label: 'Approval' },
          ]

  const alreadyReviewed =
    isDirector && (request.status === 'In Progress' || request.status === 'At Risk')
  const alreadyExited = isDirector && request.status === 'Exited'
  const wasSeen =
    alreadyReviewed ||
    alreadyExited ||
    request.status === 'On Hold' ||
    (isAdmin && Boolean(request.adminDecision))

  const [completedSteps, setCompletedSteps] = useState<StepId[]>(() => {
    if (alreadyExited) return ['brief']
    if (alreadyReviewed) return ['brief', 'alignment', 'canvas']
    return []
  })
  const [activeStep, setActiveStep] = useState<StepId>(alreadyReviewed ? 'approval' : 'brief')
  // The agent run plays the first time the brief opens, then the brief takes over
  const [runDone, setRunDone] = useState(!animateAgentRun || wasSeen)
  const [readyTeams, setReadyTeams] = useState({
    strategy: alreadyReviewed || !animateAgentRun,
    internal: alreadyReviewed || !animateAgentRun,
  })

  const completeStep = (id: StepId) =>
    setCompletedSteps((prev) => (prev.includes(id) ? prev : [...prev, id]))

  const [localDecision, setLocalDecision] = useState<{
    decision: BriefDecisionChoice
    reason: string
  } | null>(null)
  const isRejected =
    isDirector &&
    (request.status === 'Exited' ||
      request.decision?.status === 'rejected' ||
      localDecision?.decision === 'reject')
  const firstOpenIndex = stepDefs.findIndex((d) => !completedSteps.includes(d.id))
  const stepperSteps: WorkflowStep[] = stepDefs.map((d, i) => {
    const state: WorkflowStep['state'] = completedSteps.includes(d.id)
      ? 'completed'
      : isRejected
        ? 'closed'
        : i === firstOpenIndex
          ? 'current'
          : 'upcoming'
    return {
      id: d.id,
      label: d.label,
      state,
      caption:
        state === 'current' && d.id === 'brief'
          ? 'To review'
          : state === 'current' && d.id === 'approval'
            ? 'Tracking'
            : undefined,
    }
  })

  const goToStep = (id: string) => {
    const target = stepperSteps.find((st) => st.id === id)
    if (!target || target.state === 'upcoming' || target.state === 'closed') return
    setActiveStep(id as StepId)
  }

  const advanceTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const stepperRef = React.useRef<HTMLDivElement>(null)
  const isFirstStepRender = React.useRef(true)

  const analysisActions = React.useMemo(
    () => (isAdmin ? buildAdminAgentActions(request, allRequests) : buildAgentActions(request)),
    [isAdmin, request, allRequests]
  )

  const handleRunComplete = () => {
    // Let the finished checklist settle for a moment, then show the brief
    advanceTimer.current = setTimeout(() => setRunDone(true), 1100)
  }

  React.useEffect(() => () => clearTimeout(advanceTimer.current), [])

  React.useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false
      return
    }
    const el = stepperRef.current
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeStep])

  // Director decision on the brief
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [infoReason, setInfoReason] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleBriefDecision = (decision: BriefDecisionChoice, reason: string) => {
    if (decision === 'request_info') {
      setInfoReason(reason)
      setShowInfoModal(true)
      return
    }
    setLocalDecision({ decision, reason })
    completeStep('brief')
    if (decision === 'approve') {
      onProceed?.(request.id, reason)
      setActiveStep('alignment')
    } else {
      onReject?.(request.id, reason)
    }
  }

  const handleSendInfo = (email: { to: string; subject: string; body: string }) => {
    onRequestInfo?.(request.id, email)
    setShowInfoModal(false)
  }

  const briefSubmitted: { decision: BriefDecisionChoice; reason?: string } | undefined = !isDirector
    ? undefined
    : request.status === 'On Hold'
      ? {
          decision: 'request_info',
          reason: infoReason || 'More information requested from the vendor.',
        }
      : completedSteps.includes('brief')
        ? {
            decision: isRejected ? 'reject' : 'approve',
            reason: localDecision?.reason ?? request.decision?.reason,
          }
        : undefined

  // Partnership Admin routing, with a confirmation when it changes an earlier routing
  const [pendingRouting, setPendingRouting] = useState<AdminRouting | null>(null)
  const previousRouting = request.adminDecision

  const handleAdminSubmit = (routing: AdminRouting) => {
    const changed =
      Boolean(previousRouting) &&
      (previousRouting?.action !== routing.action || previousRouting?.type !== routing.type)
    if (changed) {
      setPendingRouting(routing)
      return
    }
    onRoute?.(request.id, routing)
  }

  const routingConsequence = (routing: AdminRouting) => {
    const wasPartnership =
      previousRouting?.action === 'proceed' && previousRouting.type === 'Partnership'
    const isPartnership = routing.action === 'proceed' && routing.type === 'Partnership'
    if (wasPartnership && !isPartnership)
      return "This will remove the case from the Director's list."
    if (!wasPartnership && isPartnership) return 'This will send the case to the Director.'
    return 'This will change where the case is routed.'
  }

  const routingLabel = (routing: AdminRouting) =>
    routing.action === 'reject' ? 'Rejected' : (routing.type ?? 'Partnership')

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
  const [sendTeam, setSendTeam] = useState<'strategy' | 'internal' | null>(null)
  const [showVendorForm, setShowVendorForm] = useState(false)
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
  // Reviewer tables: edit layout until the request is sent, tracking layout on Approval
  const canEditStrategy = !completedSteps.includes('alignment')
  const canEditInternal = !completedSteps.includes('canvas')
  const showSent = activeStep === 'approval'
  const internalRequestSent = showSent
  const strategyRequestSent = showSent

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
    const dl = d.toLowerCase()
    if (dl.includes('condition')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Conditional
        </span>
      )
    }
    const isProceed = dl === 'proceed' || dl === 'interested' || dl === 'yes, proceed'
    const isDecline = dl === 'decline' || dl === 'reject' || dl === 'declined' || dl === 'no'

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
    isAddModalOpen ||
    deletingStakeholder ||
    maxLimitWarning ||
    sendTeam ||
    showAnalysis ||
    showInfoModal ||
    pendingRouting ||
    showVendorForm ||
    isAddStrategyModalOpen ||
    deletingStrategyMember ||
    maxStrategyLimitWarning ||
    showQuestionnaireModal ||
    showJudgementCriteriaModal ||
    showQuestionnaireConfirmModal ||
    showStrategyConfirmModal
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

  const sentChip = (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      Request sent
    </span>
  )

  const sendButtonClass = (disabled: boolean) =>
    `px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-xs transition shrink-0 flex items-center gap-1.5 ${
      disabled
        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
    }`

  const stepHeader = (title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[#0d212c]">{title}</h2>
        <p className="text-xs text-[#64748b]">{subtitle}</p>
      </div>
      {action}
    </div>
  )

  const internalSection = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-[#0d212c]">Internal Interest</h3>
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
              Select up to 5 internal stakeholders to request their interest in this partnership.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0d212c]" />
            </div>
          </div>
        </div>
      </div>

      {canEditInternal && (
        <p className="text-xs text-[#64748b] -mt-2 pl-[30px] flex items-center gap-2 flex-wrap">
          <span>Reviewers answer 5 short questions.</span>
          <button
            type="button"
            onClick={() => setShowQuestionnaireModal(true)}
            className="inline-flex items-center gap-1 font-medium text-[#008a8a] hover:text-[#006e6e] hover:underline cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Preview questions
          </button>
        </p>
      )}

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
                    {canEditInternal && <th className="py-3 px-4 text-right">Actions</th>}
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
                              (idx === 0 ? 'Completed' : idx === 1 ? 'In Progress' : 'Pending')
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

                        {canEditInternal && (
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 justify-end">
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
                        )}
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
      {canEditInternal && (
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
  )

  const strategySection = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-[#0d212c]">Strategy Team</h3>
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
      </div>

      {canEditStrategy && (
        <p className="text-xs text-[#64748b] -mt-2 pl-[30px] flex items-center gap-2 flex-wrap">
          <span>Reviewers rate 7 criteria and give a final decision.</span>
          <button
            type="button"
            onClick={() => setShowJudgementCriteriaModal(true)}
            className="inline-flex items-center gap-1 font-medium text-[#008a8a] hover:text-[#006e6e] hover:underline cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Preview criteria
          </button>
        </p>
      )}

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
                    {canEditStrategy && <th className="py-3 px-4 text-right">Actions</th>}
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

                        {canEditStrategy && (
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 justify-end">
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
                        )}
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
      {canEditStrategy && (
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="relative group inline-block shrink-0">
            <button
              type="button"
              disabled={strategyMembers.length >= 1}
              onClick={handleOpenAddStrategyMember}
              className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition ${
                strategyMembers.length >= 1
                  ? 'border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed shadow-none'
                  : 'border border-[#cbd5e1] bg-white text-[#0d212c] hover:bg-slate-50 hover:border-slate-400 cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Member</span>
            </button>
            <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute left-0 top-full mt-2 z-40 whitespace-nowrap bg-[#0d212c] text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl text-center">
              {strategyMembers.length >= 1 ? 'Only 1 member for now' : 'Add 1 member'}
              <div className="absolute bottom-full left-4 border-4 border-transparent border-b-[#0d212c]" />
            </div>
          </div>
          <span className="text-xs text-[#64748b]">You can add 1 member for now.</span>
        </div>
      )}
    </div>
  )

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

      {/* Tabs sit directly under the back link */}
      <div role="tablist" className="flex items-center gap-8 border-b border-[#e2e8f0] pb-0">
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'review', label: 'Review' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3.5 text-sm font-medium transition-all relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-[#36c0c9] font-semibold border-b-2 border-[#36c0c9]'
                : 'text-[#64748b] hover:text-[#0d212c] border-b-2 border-transparent'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
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

      {/* On hold: waiting for the vendor to send more information */}
      {request.status === 'On Hold' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex items-start justify-between gap-4 flex-wrap text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-semibold">On hold: waiting for the vendor</div>
              <div className="mt-1 text-xs opacity-90 leading-relaxed">
                {request.holdInfo
                  ? `Information requested on ${request.holdInfo.requestedOn}. The case continues once the vendor replies.`
                  : 'The case continues once the vendor replies.'}
              </div>
            </div>
          </div>
          {isDirector && (
            <button
              type="button"
              onClick={() => onResume?.(request.id)}
              className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-medium text-xs sm:text-sm cursor-pointer transition"
            >
              Mark info received
            </button>
          )}
        </div>
      )}

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

        {/* TAB: REVIEW — step-by-step workflow, later steps unlock one at a time */}
        {activeTab === 'review' && (
          <div
            ref={stepperRef}
            className="flex flex-col gap-8 w-full animate-in fade-in duration-200 scroll-mt-4"
          >
            {stepperSteps.length > 1 && (
              <WorkflowStepper steps={stepperSteps} activeId={activeStep} onSelect={goToStep} />
            )}

            <div
              key={activeStep}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* STEP: Initial Assessment Brief (agent run first, then the brief) */}
              {activeStep === 'brief' &&
                (!runDone ? (
                  <AgentActions
                    request={request}
                    actions={analysisActions}
                    animate
                    onComplete={handleRunComplete}
                  />
                ) : (
                  <AssessmentBrief
                    request={request}
                    actions={analysisActions}
                    hideContact={isNonDirector}
                    onViewVendorResponse={() => setShowVendorForm(true)}
                    onOpenAnalysis={() => setShowAnalysis(true)}
                    decision={
                      isDirector ? (
                        <BriefDecision
                          key={request.status === 'On Hold' ? 'hold' : 'open'}
                          agentRecommendation={request.agentRecommendation?.status}
                          onSubmit={handleBriefDecision}
                          submitted={briefSubmitted}
                        />
                      ) : isAdmin ? (
                        <AdminDecision
                          key={request.adminDecision ? 'decided' : 'open'}
                          typeConfidence={getTypeConfidence(request)}
                          submitted={request.adminDecision}
                          canEdit={!hasDirectorDecided(request)}
                          onSubmit={handleAdminSubmit}
                        />
                      ) : undefined
                    }
                    footer={
                      isNonDirector ? (
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              completeStep('brief')
                              setActiveStep(isInternalTeam ? 'questionnaire' : 'judgement')
                            }}
                            className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-sm font-semibold shadow-xs cursor-pointer transition flex items-center gap-2"
                          >
                            {isInternalTeam ? 'Continue to Questionnaire' : 'Continue to Judgement'}
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      ) : undefined
                    }
                  />
                ))}

              {/* STEP: Strategic Alignment (Director) */}
              {isDirector &&
                activeStep === 'alignment' &&
                (!readyTeams.strategy ? (
                  <ReviewersLoading
                    team="strategy"
                    count={strategyMembers.length}
                    onComplete={() => setReadyTeams((r) => ({ ...r, strategy: true }))}
                  />
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    {stepHeader(
                      'Strategic Alignment',
                      'Choose the Strategy Team reviewer, then send the request.',
                      canEditStrategy ? (
                        <button
                          type="button"
                          disabled={strategyMembers.length === 0}
                          onClick={() => setSendTeam('strategy')}
                          className={sendButtonClass(strategyMembers.length === 0)}
                        >
                          <Send className="w-4 h-4" aria-hidden="true" />
                          <span>Send Request</span>
                        </button>
                      ) : (
                        sentChip
                      )
                    )}
                    {strategySection}
                  </div>
                ))}

              {/* STEP: Internal Canvas (Director) */}
              {isDirector &&
                activeStep === 'canvas' &&
                (!readyTeams.internal ? (
                  <ReviewersLoading
                    team="internal"
                    count={stakeholders.length}
                    onComplete={() => setReadyTeams((r) => ({ ...r, internal: true }))}
                  />
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    {stepHeader(
                      'Internal Canvas',
                      'Choose the Internal Interest reviewers, then send the request.',
                      canEditInternal ? (
                        <button
                          type="button"
                          disabled={stakeholders.length === 0}
                          onClick={() => setSendTeam('internal')}
                          className={sendButtonClass(stakeholders.length === 0)}
                        >
                          <Send className="w-4 h-4" aria-hidden="true" />
                          <span>Send Request</span>
                        </button>
                      ) : (
                        sentChip
                      )
                    )}
                    {internalSection}
                  </div>
                ))}

              {/* STEP: Approval (Director) */}
              {isDirector && activeStep === 'approval' && (
                <div className="flex flex-col gap-6 w-full">
                  {stepHeader(
                    'Approval',
                    'Track each reviewer’s response. This updates as reviewers respond.'
                  )}
                  {strategySection}
                  <div className="h-[1px] bg-[#e2e8f0] w-full my-2" />
                  {internalSection}
                </div>
              )}

              {/* STEP: Questionnaire (Internal Interest Team) */}
              {isInternalTeam && activeStep === 'questionnaire' && (
                <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in duration-150">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-[#0d212c]">
                      Internal Evaluation Questionnaire
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      Complete the questions below to evaluate clinical need, pilot sponsorship, and
                      strategic feasibility.
                    </p>
                  </div>

                  <QuestionnaireForm
                    values={questionnaire}
                    onChange={patchQuestionnaire}
                    readOnly={questionnaireSubmitted}
                    onSubmit={() => setShowQuestionnaireConfirmModal(true)}
                    onCancel={handleCancelQuestionnaire}
                  />
                </div>
              )}

              {/* STEP: Judgement (Strategy Team) */}
              {isStrategyTeam && activeStep === 'judgement' && (
                <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in duration-150">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-[#0d212c]">Your judgement</h2>
                    <p className="text-xs text-[#64748b]">
                      Pre-filled by the agent, with its reasoning. Change any you disagree with and
                      tell us why.
                    </p>
                  </div>

                  <JudgementForm
                    entries={judgementEntries}
                    onEntryChange={handleJudgementEntryChange}
                    decision={strategyDecision}
                    onDecisionChange={handleStrategyDecisionChange}
                    decisionNote={strategyDecisionNote}
                    onDecisionNoteChange={setStrategyDecisionNote}
                    readOnly={strategyJudgementSubmitted}
                    onSubmit={() => setShowStrategyConfirmModal(true)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODALS — Designed strictly matching SOW Generator App */}

      {/* AI ANALYSIS DRAWER */}
      {showAnalysis && (
        <AnalysisDrawer
          request={request}
          actions={analysisActions}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {/* REQUEST MORE INFO EMAIL */}
      {showInfoModal && (
        <RequestInfoModal
          request={request}
          reason={infoReason}
          senderName={userProfile?.name ?? 'Director'}
          onSend={handleSendInfo}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* CONFIRM CHANGING AN EARLIER ROUTING (Partnership Admin) */}
      {pendingRouting && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-routing-title"
            className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 id="confirm-routing-title" className="text-lg font-semibold text-[#0d212c]">
                Change how this case is routed?
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">From</span>
                <span className="font-semibold text-[#0d212c]">
                  {previousRouting ? routingLabel(previousRouting) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">To</span>
                <span className="font-semibold text-[#0d212c]">{routingLabel(pendingRouting)}</span>
              </div>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">
              {routingConsequence(pendingRouting)}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setPendingRouting(null)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoute?.(request.id, pendingRouting)
                  setPendingRouting(null)
                }}
                className="px-5 py-2.5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-semibold shadow-xs cursor-pointer transition"
              >
                Confirm change
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

      {/* SEND REVIEW REQUESTS TO BOTH TEAMS */}
      {sendTeam && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-team-title"
            className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#36c0c9]/10 text-[#36c0c9] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div>
                  <h3 id="send-team-title" className="text-lg font-semibold text-[#0d212c]">
                    {sendTeam === 'strategy'
                      ? 'Send to the Strategy Team'
                      : 'Send to Internal Interest'}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    The reviewers are notified as soon as you send it.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSendTeam(null)}
                aria-label="Close send review request"
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(
              [
                {
                  key: 'internal',
                  title: 'Internal Interest',
                  people: stakeholders,
                  selected: selectedInternalSendIds,
                  toggle: toggleInternalSendMember,
                  note: internalSendNote,
                  setNote: setInternalSendNote,
                  due: '5 business days',
                },
                {
                  key: 'strategy',
                  title: 'Strategy Team',
                  people: strategyMembers,
                  selected: selectedStrategySendIds,
                  toggle: toggleStrategySendMember,
                  note: strategySendNote,
                  setNote: setStrategySendNote,
                  due: '2-3 business days',
                },
              ] as const
            )
              .filter((team) => team.key === sendTeam)
              .map((team) => (
                <div key={team.key} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="text-sm font-semibold text-[#0d212c]">
                      {team.title}{' '}
                      <span className="font-normal text-[#64748b]">
                        ({team.selected.length} selected)
                      </span>
                    </h4>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      Response due in {team.due}
                    </span>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
                    {team.people.map((person) => {
                      const isChecked = team.selected.includes(person.id)
                      return (
                        <div
                          key={person.id}
                          onClick={() => team.toggle(person.id)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              role="checkbox"
                              aria-checked={isChecked}
                              aria-label={person.name}
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

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`send-note-${team.key}`}
                      className="text-xs font-medium text-[#0d212c]"
                    >
                      Note to {team.title}
                    </label>
                    <textarea
                      id={`send-note-${team.key}`}
                      rows={4}
                      value={team.note}
                      onChange={(e) => team.setNote(e.target.value)}
                      className="w-full p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] flex-wrap">
              <span className="text-xs text-[#64748b]">
                {(sendTeam === 'strategy' ? selectedStrategySendIds : selectedInternalSendIds)
                  .length === 0
                  ? 'Select at least one reviewer.'
                  : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSendTeam(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    (sendTeam === 'strategy' ? selectedStrategySendIds : selectedInternalSendIds)
                      .length === 0
                  }
                  onClick={() => {
                    if (sendTeam === 'strategy') {
                      completeStep('alignment')
                      setActiveStep('canvas')
                      setReviewToast('Request sent to the Strategy Team.')
                    } else {
                      completeStep('canvas')
                      setActiveStep('approval')
                      setReviewToast('Request sent to the Internal Interest team.')
                    }
                    setSendTeam(null)
                  }}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                    (sendTeam === 'strategy' ? selectedStrategySendIds : selectedInternalSendIds)
                      .length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer'
                  }`}
                >
                  Send Request
                </button>
              </div>
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
                You can add 1 strategy team member per partnership request for now. Please remove an
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
          <div className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
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
              <QuestionnaireForm
                readOnly
                values={questionnaireFromResponse(viewingResponseMember.response)}
              />
            ) : viewingResponseMember.strategyResponse ? (
              <JudgementForm
                readOnly
                entries={judgementEntriesFromResponse(viewingResponseMember.strategyResponse)}
                decision={viewingResponseMember.strategyResponse.finalDecision ?? null}
                decisionNote={viewingResponseMember.strategyResponse.finalDecisionNote ?? ''}
              />
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

      {/* SUBMIT QUESTIONNAIRE CONFIRMATION MODAL (SOW Creator Style) */}
      {showQuestionnaireConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#0f766e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#36c0c9]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d212c]">Submit Questionnaire</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Are you sure you want to send this questionnaire for Director Review?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionnaireConfirmModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748b] leading-relaxed">
              Once submitted, your answers go to the Director and can no longer be edited.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowQuestionnaireConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer bg-transparent transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitQuestionnaire}
                className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-semibold cursor-pointer border-0 transition shadow-xs"
              >
                Confirm &amp; Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT STRATEGY JUDGEMENT CONFIRMATION MODAL (SOW Creator Style) */}
      {showStrategyConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e6fffa] text-[#0f766e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#36c0c9]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d212c]">Submit Strategy Decision</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Are you sure you want to send this decision for Director Review?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStrategyConfirmModal(false)}
                className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Your decision:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md ${
                    strategyDecision === 'Yes, proceed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : strategyDecision === 'Proceed with a condition'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                  }`}
                >
                  {strategyDecision}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Judgements changed from the agent:</span>
                <span className="font-semibold text-[#0d212c]">{editedJudgementCount}</span>
              </div>
              {strategyDecisionNote.trim() && (
                <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
                  <span className="text-[#64748b]">Summary:</span>
                  <p className="text-[#0d212c] italic">
                    &ldquo;{strategyDecisionNote.trim()}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setShowStrategyConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer bg-transparent transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitStrategyJudgement}
                className="px-6 py-2.5 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] text-white text-xs font-semibold cursor-pointer border-0 transition shadow-xs"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showVendorForm && (
        <VendorFormResponse
          request={request}
          hideContact={isNonDirector}
          onClose={() => setShowVendorForm(false)}
        />
      )}

      {/* TOAST NOTIFICATION (SOW Creator Design - No Dot) */}
      {reviewToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl bg-white border border-[#e2e8f0] text-xs sm:text-sm font-medium text-[#0d212c] flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-lg bg-[#e6fffa] text-[#0f766e] flex items-center justify-center border border-[#ccfbf1] shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#36c0c9]" />
          </div>
          <span>{reviewToast}</span>
        </div>
      )}
    </div>
  )
}
