'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  Users,
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
  ArrowLeftRight,
  Clock,
  Eye,
  Pencil,
} from 'lucide-react'
import { StatusChip } from '@/components/atoms/StatusChip'
import {
  buildAdminAgentActions,
  buildAgentActions,
  getTypeConfidence,
} from '@/components/organisms/AgentActions'
import { AdminActionModal } from '@/components/organisms/AdminActionModal'
import { AuditLog } from '@/components/organisms/AuditLog'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { SendInternalModal } from '@/components/organisms/SendInternalModal'
import { ThinkingMode } from '@/components/organisms/ThinkingMode'
import { NdaDiscoveryStage } from '@/components/organisms/NdaDiscoveryStage'
import { ValueDueDiligenceStage } from '@/components/organisms/ValueDueDiligenceStage'
import { SponsorAssignModal } from '@/components/organisms/SponsorAssignModal'
import { PrototypeScenarioSelect } from '@/components/molecules/PrototypeScenarioSelect'
import { AnalysisDrawer } from '@/components/organisms/AnalysisDrawer'
import { buildInfoEmail, hasDirectorDecided, type AdminRouting } from '@/lib/caseActions'
import { AssessmentBrief } from '@/components/organisms/AssessmentBrief'
import { BriefDecisionModal } from '@/components/organisms/BriefDecisionModal'
import { ReviewersLoading } from '@/components/molecules/ReviewersLoading'
import { WorkflowStepper, type WorkflowStep } from '@/components/molecules/WorkflowStepper'
import {
  KnowledgeBaseUpload,
  type KnowledgeBaseFile,
} from '@/components/organisms/KnowledgeBaseUpload'
import { PreReadSummary } from '@/components/organisms/PreReadSummary'
import { StrategyDecisionModal } from '@/components/organisms/StrategyDecisionModal'
import {
  isQuestionnaireComplete,
  ReviewQuestionnaire,
  type QuestionAnswerValue,
} from '@/components/organisms/ReviewQuestionnaire'
import { VendorFormResponse } from '@/components/organisms/VendorFormResponse'
import { sampleAnswersFor } from '@/lib/sampleAnswers'
import { DEFAULT_QUESTIONNAIRE_ID, getQuestionnaire } from '@/types/questionnaires'
import type { PartnershipDetailProps, DetailTab } from './PartnershipDetail.types'
import {
  DEFAULT_INTERNAL_INTERESTS,
  DEFAULT_STRATEGY_MEMBERS,
  type InternalInterestStakeholder,
  type StrategyDecision,
  type QuestionAnswer,
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
    name: 'Dr. Zainab',
    role: 'Head of Strategy',
    department: 'Strategy',
    expertise: 'Market Strategy',
    initials: 'DZ',
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

const PRE_READ_CHECKS = [
  'Reading the vendor submission',
  'Reviewing the knowledge base',
  'Comparing with the roadmap and backlog',
  'Checking architecture and ownership',
  'Preparing the pre-read summary',
]

type StepId = 'brief' | 'canvas' | 'alignment' | 'nda' | 'value' | 'questionnaire' | 'preread'

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
  onLog,
  onSendReview,
  onSubmitReview,
  onCaseAction,
  animateAgentRun = true,
  className = '',
}) => {
  const isInternalTeam =
    userProfile?.id === 'evaluator' || userProfile?.roleTitle === 'Internal Interest Team'
  const isStrategyTeam =
    userProfile?.id === 'strategy-fit' || userProfile?.roleTitle === 'Strategy Team'
  const isNonDirector = isInternalTeam || isStrategyTeam
  const isAdmin = userProfile?.id === 'partnership-admin'
  const isSponsor = userProfile?.id === 'sponsor' || userProfile?.roleTitle === 'Sponsor'
  /** The Director takes the decisions in the review flow */
  const isDirector = !isNonDirector && !isAdmin && !isSponsor
  /** The Director and the sponsor both follow the whole flow; the sponsor only acts late on */
  const isDirectorView = isDirector || isSponsor
  /** Everyone who follows the whole flow; the Admin sees every stage but cannot act in them */
  const isFlowView = isDirectorView || isAdmin

  // Delete note state
  const [deleteNote, setDeleteNote] = useState('')

  // View member response modal state
  const [viewingResponseMember, setViewingResponseMember] =
    useState<InternalInterestStakeholder | null>(null)

  // Questions the Director sent (or the default set) and this reviewer's answers
  const reviewQuestions =
    request.sentQuestionnaire?.questions ?? getQuestionnaire(DEFAULT_QUESTIONNAIRE_ID).questions
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, QuestionAnswerValue>>({})
  const [showQuestionnaireConfirmModal, setShowQuestionnaireConfirmModal] = useState(false)
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false)

  const patchAnswer = (id: string, patch: Partial<QuestionAnswerValue>) =>
    setQuestionAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { answer: '' }), ...patch } }))

  // Clicking any answer box fills the whole questionnaire with realistic answers
  const prefillQuestionnaire = () => {
    if (questionnaireSubmitted) return
    if (Object.values(questionAnswers).some((a) => a.answer.trim())) return
    const samples = sampleAnswersFor(reviewQuestions)
    setQuestionAnswers(
      Object.fromEntries(reviewQuestions.map((q) => [q.id, { answer: samples[q.id] }]))
    )
  }

  const handleConfirmSubmitQuestionnaire = () => {
    const answers: QuestionAnswer[] = reviewQuestions.map((q) => ({
      questionId: q.id,
      question: q.text,
      cue: q.cue,
      answer: questionAnswers[q.id]?.answer ?? '',
    }))
    onSubmitReview?.(request.id, 'internal', { answers })
    setShowQuestionnaireConfirmModal(false)
    setQuestionnaireSubmitted(true)
    completeStep('questionnaire')
    setReviewToast('Questionnaire submitted successfully for Director Review.')
  }

  // Strategy Team: knowledge base, generated pre-read and the decision
  const [kbFiles, setKbFiles] = useState<KnowledgeBaseFile[]>([])
  const [strategyModal, setStrategyModal] = useState<'proceed' | 'reject' | null>(null)
  const [pendingStrategy, setPendingStrategy] = useState<{
    decision: StrategyDecision
    reason: string
  } | null>(null)
  const [strategyDecided, setStrategyDecided] = useState(false)
  const strategyMine = request.strategyTeamMembers?.[0]?.strategyResponse
  const [lastStrategyDecision, setLastStrategyDecision] = useState<StrategyDecision | null>(null)
  const strategyOutcome = strategyMine?.finalDecision ?? lastStrategyDecision
  const strategyDone = strategyDecided || Boolean(request.stageApprovals?.strategy)
  const [preReadStage, setPreReadStage] = useState<'upload' | 'generating' | 'ready'>(
    strategyDone ? 'ready' : 'upload'
  )

  const handleConfirmStrategyDecision = () => {
    if (!pendingStrategy) return
    const response: StrategyMemberResponse = {
      documents: kbFiles.map((f) => f.name),
      finalDecision: pendingStrategy.decision,
      finalDecisionNote: pendingStrategy.reason,
      submittedAt: 'Just now',
    }
    onSubmitReview?.(request.id, 'strategy', { response })
    setLastStrategyDecision(pendingStrategy.decision)
    setPendingStrategy(null)
    setStrategyDecided(true)
    completeStep('preread')
    setReviewToast('Strategy decision submitted successfully for Director Review.')
  }

  const [activeTab, setActiveTab] = useState<DetailTab>('review')

  // Review workflow: each step unlocks only after the one before it is done
  const stepDefs: { id: StepId; label: string }[] = isInternalTeam
    ? [
        { id: 'brief', label: 'Initial Assessment Brief' },
        { id: 'questionnaire', label: 'Questionnaire' },
      ]
    : isStrategyTeam
      ? [
          // The Strategy lead sees every stage; their own work is the pre-read, in Strategic Alignment
          { id: 'brief', label: 'Initial Assessment Brief' },
          { id: 'canvas', label: 'Internal Canvas' },
          { id: 'preread', label: 'Strategic Alignment' },
          { id: 'nda', label: 'NDA & Discovery' },
          { id: 'value', label: 'Value & Due Diligence' },
        ]
      : [
          { id: 'brief', label: 'Initial Assessment Brief' },
          { id: 'canvas', label: 'Internal Canvas' },
          { id: 'alignment', label: 'Strategic Alignment' },
          { id: 'nda', label: 'NDA & Discovery' },
          { id: 'value', label: 'Value & Due Diligence' },
        ]

  const [localDecision, setLocalDecision] = useState<{
    decision: 'approve' | 'reject'
    reason: string
  } | null>(null)
  const [localSent, setLocalSent] = useState<{ internal?: boolean; strategy?: boolean }>({})

  // For the Director, progress comes from the case itself, so it survives switching profiles
  const isClosedAfterBrief = isFlowView && request.status === 'Closed'
  const isRejected =
    isFlowView &&
    !isClosedAfterBrief &&
    (request.status === 'Exited' ||
      request.decision?.status === 'rejected' ||
      localDecision?.decision === 'reject')
  const briefApproved =
    isFlowView &&
    (request.decision?.status === 'proceeded' ||
      request.status === 'In Progress' ||
      request.status === 'At Risk' ||
      localDecision?.decision === 'approve')
  const internalSent = Boolean(request.sent?.internal) || Boolean(localSent.internal)
  const strategySent = Boolean(request.sent?.strategy) || Boolean(localSent.strategy)
  const internalApproved = request.stageApprovals?.internal?.status === 'approved'
  const strategyApproved = request.stageApprovals?.strategy?.status === 'approved'
  const strategyDeclined = request.stageApprovals?.strategy?.status === 'declined'
  const strategyConditions = (
    request.strategyTeamMembers?.length ? request.strategyTeamMembers : DEFAULT_STRATEGY_MEMBERS
  )[0]?.strategyResponse?.finalDecisionNote

  // Prototype outcomes of the Internal Interest team that need the Director's input
  const [scenarioPrompt, setScenarioPrompt] = useState<'open' | 'dismissed'>('open')
  const [readyPromptOpen, setReadyPromptOpen] = useState(false)
  const internalScenario = request.internalOutcome?.scenario
  const showNotReadyConfirm =
    isDirector &&
    internalScenario === 'not-ready' &&
    !isClosedAfterBrief &&
    scenarioPrompt === 'open'
  const showSponsorAssign =
    isDirector &&
    internalScenario === 'multiple' &&
    !request.sponsors &&
    !isClosedAfterBrief &&
    scenarioPrompt === 'open'
  // One person is ready to sponsor: say so, then move on to Strategic Alignment either way
  const showSponsorReady =
    isDirector && readyPromptOpen && internalScenario === 'single' && Boolean(request.sponsors)
  const goToAlignment = () => {
    setReadyPromptOpen(false)
    setActiveStep('alignment')
  }
  const sponsorCandidates = (request.internalInterests ?? []).filter((m) => m.sponsor === 'Yes')

  // A decided strategy case has both steps behind it already
  const [completedSteps, setCompletedSteps] = useState<StepId[]>(() =>
    isStrategyTeam && request.stageApprovals?.strategy ? ['brief', 'preread'] : []
  )
  const completeStep = (id: StepId) =>
    setCompletedSteps((prev) => (prev.includes(id) ? prev : [...prev, id]))

  const isStepCompleted = (id: StepId) => {
    if (isStrategyTeam) {
      // The case only reaches the Strategy lead once the Internal Interest stage is behind it
      if (id === 'canvas') return true
      if (id === 'preread') return strategyDone
      if (id === 'nda') return Boolean(request.discovery?.proceededOn)
      if (id === 'value') return Boolean(request.value?.tddGeneratedOn)
      return completedSteps.includes(id)
    }
    if (!isFlowView) return completedSteps.includes(id)
    if (id === 'brief') return briefApproved || isRejected
    if (id === 'canvas') return internalApproved
    if (id === 'alignment') return strategyApproved
    if (id === 'nda') return Boolean(request.discovery?.proceededOn)
    if (id === 'value') return Boolean(request.value?.tddGeneratedOn)
    return false
  }

  const firstOpenIndex = stepDefs.findIndex((d) => !isStepCompleted(d.id))
  const stepperSteps: WorkflowStep[] = stepDefs.map((d, i) => {
    const completed = isStepCompleted(d.id)
    const state: WorkflowStep['state'] = completed
      ? 'completed'
      : isRejected || isClosedAfterBrief
        ? 'closed'
        : i === firstOpenIndex
          ? 'current'
          : 'upcoming'
    let caption: string | undefined
    if (state === 'current' && d.id === 'brief') caption = 'To review'
    if ((d.id === 'nda' || d.id === 'value') && completed) caption = 'Completed'
    if (d.id === 'canvas' || d.id === 'alignment') {
      const sent = d.id === 'canvas' ? internalSent : strategySent
      if (completed) caption = 'Approved'
      else if (state === 'current' && d.id === 'alignment' && strategyDeclined) caption = 'Declined'
      else if (state === 'current' && sent) caption = 'Awaiting approval'
    }
    // Later stages stay locked for the Strategy lead until the Director has acted
    if (isStrategyTeam && (d.id === 'nda' || d.id === 'value') && !completed) {
      const unlocked =
        d.id === 'nda' ? Boolean(request.alignmentPackOn) : Boolean(request.discovery?.proceededOn)
      return { id: d.id, label: d.label, state: unlocked ? 'current' : 'upcoming', caption }
    }
    if (isStrategyTeam && d.id === 'preread' && strategyDone) {
      caption = strategyOutcome === 'Reject' ? 'Declined' : 'Approved'
    }
    return { id: d.id, label: d.label, state, caption }
  })

  const [activeStep, setActiveStep] = useState<StepId>(() => {
    // The Strategy lead's own work is the pre-read; later stages are theirs to view only
    if (isStrategyTeam || isAdmin) return 'brief'
    const open = stepDefs.find((d) => !isStepCompleted(d.id))
    return (open ?? stepDefs[stepDefs.length - 1]).id
  })

  // Once the Strategy Team has approved, the Director acknowledges it and moves on to the NDA stage
  const [strategyAckOpen, setStrategyAckOpen] = useState(false)
  const strategyApprovedBefore = React.useRef(strategyApproved)
  React.useEffect(() => {
    if (!strategyApprovedBefore.current && strategyApproved && activeStep === 'alignment') {
      setStrategyAckOpen(true)
    }
    strategyApprovedBefore.current = strategyApproved
  }, [strategyApproved, activeStep])
  const acknowledgeStrategy = () => {
    setStrategyAckOpen(false)
    setActiveStep('nda')
  }

  const goToStep = (id: string) => {
    const target = stepperSteps.find((st) => st.id === id)
    if (!target) return
    // The Admin can look at every stage; the others unlock one at a time
    if (!isAdmin && (target.state === 'upcoming' || target.state === 'closed')) return
    setActiveStep(id as StepId)
  }

  const wasSeen =
    isRejected ||
    briefApproved ||
    request.status === 'Information Requested' ||
    isSponsor ||
    isStrategyTeam ||
    (isAdmin && Boolean(request.adminDecision))
  // The agent thinks first, every time a case is opened for the first time in this view
  const [runDone, setRunDone] = useState(!animateAgentRun || wasSeen)
  const [readyTeams, setReadyTeams] = useState({
    strategy: !animateAgentRun || strategySent || isSponsor || isAdmin,
    internal: !animateAgentRun || internalSent || isSponsor || isStrategyTeam || isAdmin,
  })

  // While the agent finds the reviewers, the animation owns the page and only the tabs stay
  const reviewersLoading =
    isDirector &&
    activeTab === 'review' &&
    ((activeStep === 'canvas' && briefApproved && !internalApproved && !readyTeams.internal) ||
      (activeStep === 'alignment' && !readyTeams.strategy))

  const stepperRef = React.useRef<HTMLDivElement>(null)
  const isFirstStepRender = React.useRef(true)

  const analysisActions = React.useMemo(
    () => (isAdmin ? buildAdminAgentActions(request, allRequests) : buildAgentActions(request)),
    [isAdmin, request, allRequests]
  )

  const handleRunComplete = () => {
    setRunDone(true)
    const risks = analysisActions.filter((a) => a.status === 'attention')
    onLog?.(request.id, {
      key: `${request.id}-brief-generated`,
      title: 'Initial assessment brief generated',
      description: `${analysisActions.length} checks run. ${
        risks.length === 0
          ? 'No risks identified.'
          : `${risks.length} ${risks.length === 1 ? 'risk' : 'risks'} identified.`
      }`,
      actor: 'Triage Agent',
      kind: 'agent',
    })
    if (risks.length > 0) {
      onLog?.(request.id, {
        key: `${request.id}-risks-identified`,
        title: 'Risks identified',
        description: risks.map((r) => r.title).join(', '),
        actor: 'Triage Agent',
        kind: 'critical',
      })
    }
  }

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
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [briefModal, setBriefModal] = useState(false)

  const handleBriefDecision = (decision: 'approve' | 'reject', reason: string) => {
    setBriefModal(false)
    setLocalDecision({ decision, reason })
    if (decision === 'approve') {
      onProceed?.(request.id, reason)
      setActiveStep('canvas')
    } else {
      onReject?.(request.id, reason)
    }
  }

  const handleSendInfo = (email: { to: string; subject: string; body: string }) => {
    setBriefModal(false)
    onRequestInfo?.(request.id, email)
  }

  const briefSubmitted =
    isDirector && (request.status === 'Information Requested' || briefApproved || isRejected)

  // Partnership Admin: decision popups, with a confirmation when it changes an earlier routing
  const [adminModal, setAdminModal] = useState<'proceed' | 'reject' | 'reassign' | null>(null)
  const [pendingRouting, setPendingRouting] = useState<AdminRouting | null>(null)
  const previousRouting = request.adminDecision
  const adminCanChange = isAdmin && !hasDirectorDecided(request)

  const handleAdminConfirm = (routing: AdminRouting) => {
    setAdminModal(null)
    const changed =
      Boolean(previousRouting) &&
      (previousRouting?.action !== routing.action || previousRouting?.type !== routing.type)
    if (changed) {
      setPendingRouting(routing)
      return
    }
    onRoute?.(request.id, routing)
  }

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
      case 'Closed':
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

  // Once a request is sent the case holds the reviewers' status and answers
  React.useEffect(() => {
    if (request.sent?.internal && request.internalInterests?.length) {
      setStakeholders(request.internalInterests)
    }
  }, [request.sent?.internal, request.internalInterests])

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
  React.useEffect(() => {
    if (request.sent?.strategy && request.strategyTeamMembers?.length) {
      setStrategyMembers(request.strategyTeamMembers.slice(0, 1))
    }
  }, [request.sent?.strategy, request.strategyTeamMembers])

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
  const [internalSendNote] = useState(
    `Hi,\n\nWe have received a partnership request from ${request.companyName}. We would value your input and would like to confirm your interest in exploring this opportunity.\n\nPlease review the details in the Tech Due Diligence workspace and share your response.`
  )
  const [strategySendNote, setStrategySendNote] = useState(
    `Hi,\n\nWe have received a partnership request from ${request.companyName}. Please review the strategic alignment and market expansion potential for this partnership.\n\nPlease review the details in the Tech Due Diligence workspace and share your response.`
  )
  const [reviewToast, setReviewToast] = useState<string | null>(null)
  // Reviewer tables: edit layout until that request is sent, tracking layout afterwards
  const canEditStrategy = isDirector && !strategySent
  const canEditInternal = isDirector && !internalSent
  const internalRequestSent = internalSent
  const strategyRequestSent = strategySent

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
          Reject
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
    setIsAddStrategyModalOpen(false)
  }

  const handleConfirmDeleteStrategyMember = () => {
    if (!deletingStrategyMember) return
    setStrategyMembers(strategyMembers.filter((p) => p.id !== deletingStrategyMember.id))
    setDeletingStrategyMember(null)
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
    pendingRouting ||
    showVendorForm ||
    isAddStrategyModalOpen ||
    deletingStrategyMember ||
    maxStrategyLimitWarning ||
    adminModal ||
    showQuestionnaireConfirmModal ||
    briefModal ||
    showNotReadyConfirm ||
    showSponsorAssign ||
    showSponsorReady ||
    strategyAckOpen ||
    strategyModal ||
    pendingStrategy
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

  // The agent thinks first when a case is opened
  if (!runDone) return <ThinkingMode onComplete={handleRunComplete} />

  // The vendor card tops the first step; later steps use the space for the workflow stages
  const showHeaderCard = !(isFlowView || isStrategyTeam) || activeStep === 'brief'
  // The NDA stage fills the page height so only its own content scrolls
  const fixedStage =
    activeTab === 'review' &&
    activeStep === 'nda' &&
    (isFlowView || isStrategyTeam) &&
    !reviewersLoading

  const stageChip = (state: 'awaiting' | 'approved' | 'declined') => (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
        state === 'approved'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : state === 'declined'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      {state === 'approved' ? (
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      ) : state === 'declined' ? (
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Clock className="w-4 h-4" aria-hidden="true" />
      )}
      {state === 'approved' ? 'Approved' : state === 'declined' ? 'Declined' : 'Awaiting approval'}
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
                    <th className="py-3 px-4">Sponsor</th>
                    <th className="py-3 px-4">Response Date</th>
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
                  <td colSpan={8} className="py-12 text-center text-[#64748b]">
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
                stakeholders.map((person) => (
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
                            person.status === 'Completed' ? 'Completed' : 'Pending'
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs sm:text-[13px] font-medium text-[#0d212c]">
                            {person.deadline || '4 days'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderDecisionBadge(person.decision)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {person.sponsor ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                                person.sponsor === 'Yes'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {person.sponsor}
                            </span>
                          ) : (
                            <span className="text-[#94a3b8] font-medium text-xs sm:text-sm pl-1">
                              -
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs sm:text-[13px] font-medium text-[#0d212c]">
                            {person.responseDate ?? '-'}
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
    <div
      className={`flex flex-col gap-6 w-full text-[#0d212c] ${
        fixedStage ? 'h-[calc(100vh-6.75rem)] min-h-[34rem] overflow-hidden' : ''
      } ${className}`.trim()}
    >
      {/* Top Back Link */}
      {!reviewersLoading && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0d212c] hover:text-[#36c0c9] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Partnership Requests</span>
          </button>
        </div>
      )}

      {/* Tabs sit directly under the back link */}
      <div role="tablist" className="flex items-center gap-8 border-b border-[#e2e8f0] pb-0">
        {(
          [
            { id: 'review', label: 'Review' },
            { id: 'audit', label: 'Audit Log' },
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

      {activeTab !== 'audit' && !reviewersLoading && showHeaderCard && (
        <>
          {/* Header card: title and status, with the key facts directly below */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4 shadow-xs flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 shadow-2xs">
                <Building2 className="w-6 h-6 text-[#36c0c9]" />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-semibold text-[#0d212c] tracking-tight">
                    {request.companyName}
                  </h1>
                  {isAdmin &&
                  request.adminDecision &&
                  request.status !== 'Information Requested' ? (
                    <>
                      <StatusChip
                        label={request.adminDecision.action === 'proceed' ? 'Approved' : 'Rejected'}
                        status={request.adminDecision.action === 'proceed' ? 'success' : 'error'}
                        dot={false}
                      />
                      {request.adminDecision.type && (
                        <StatusChip
                          label={request.adminDecision.type}
                          status="neutral"
                          dot={false}
                        />
                      )}
                    </>
                  ) : (
                    <StatusChip
                      label={request.status}
                      status={getStatusCategory(request.status)}
                      dot={false}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#64748b]">
                  {!isNonDirector && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-medium text-[#0d212c]">{request.companyInfo.name}</span>
                    </span>
                  )}
                  {request.companyInfo.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {request.companyInfo.location}
                    </span>
                  )}
                  {!isNonDirector && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400">Referred by:</span>
                      <span className="font-medium text-[#0d212c]">
                        {request.referredBy || '—'}
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400">Submitted on:</span>
                    <span className="font-medium text-[#0d212c]">{request.submittedOn}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <button
                type="button"
                onClick={() => setShowVendorForm(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                View vendor response
              </button>
              {adminCanChange && request.adminDecision && (
                <button
                  type="button"
                  onClick={() => setAdminModal('reassign')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Information requested: waiting for the vendor to send more information */}
      {request.status === 'Information Requested' && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 flex items-start justify-between gap-4 flex-wrap text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-semibold">Information requested: waiting for the vendor</div>
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

      {/* LARGE WHITE BOX ENCLOSING TABS AND ALL CONTENT */}
      <div
        className={
          reviewersLoading
            ? 'flex flex-col'
            : `bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs flex flex-col gap-6 ${
                fixedStage ? 'flex-1 min-h-0' : ''
              }`
        }
      >
        {/* TAB: REVIEW — step-by-step workflow, later steps unlock one at a time */}
        {activeTab === 'review' && (
          <div
            ref={stepperRef}
            className={`flex flex-col gap-8 w-full animate-in fade-in duration-200 scroll-mt-4 ${
              fixedStage ? 'flex-1 min-h-0' : ''
            }`}
          >
            {stepperSteps.length > 1 && (!isNonDirector || isStrategyTeam) && !reviewersLoading && (
              <WorkflowStepper steps={stepperSteps} activeId={activeStep} onSelect={goToStep} />
            )}

            <div
              key={activeStep}
              className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                fixedStage ? 'flex-1 min-h-0' : ''
              }`}
            >
              {/* STEP: Initial Assessment Brief */}
              {activeStep === 'brief' && (
                <AssessmentBrief
                  request={request}
                  hideContact={isNonDirector}
                  showVerdict={isDirectorView || isAdmin}
                  onOpenAnalysis={() => setShowAnalysis(true)}
                />
              )}

              {/* STEP: Internal Canvas (Director and sponsor) */}
              {(isFlowView || isStrategyTeam) &&
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
                      internalApproved
                        ? 'The Internal Interest team has responded. The reviewers are listed below.'
                        : internalSent
                          ? 'Waiting for approval from the Internal Interest team. Follow each reviewer below.'
                          : isDirector
                            ? 'Choose the Internal Interest reviewers and the questions they will answer, then send the request.'
                            : 'The Director has not sent this to the Internal Interest team yet.',
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
                      ) : isDirector && internalSent && !strategySent ? (
                        // Prototype only: sits where the awaiting-approval chip used to be, and
                        // stays available so every outcome can be tried on the same screen
                        <PrototypeScenarioSelect
                          value={request.internalOutcome?.scenario}
                          onChange={(scenario) => {
                            setScenarioPrompt('open')
                            if (scenario === 'single') setReadyPromptOpen(true)
                            onCaseAction?.(request.id, { type: 'internalScenario', scenario })
                          }}
                        />
                      ) : isClosedAfterBrief && !internalApproved ? (
                        <StatusChip label="Closed" status="neutral" dot={false} />
                      ) : (
                        stageChip(internalApproved ? 'approved' : 'awaiting')
                      )
                    )}
                    {isClosedAfterBrief && request.closedReason && (
                      <p className="text-sm text-[#475569] leading-relaxed -mt-2">
                        This case was closed: {request.closedReason}
                      </p>
                    )}
                    {request.sponsors && (
                      <p className="text-sm text-[#0d212c] -mt-2">
                        <span className="font-semibold">Lead sponsor:</span> {request.sponsors.lead}
                        {request.sponsors.co.length > 0 && (
                          <>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="font-semibold">Co-sponsors:</span>{' '}
                            {request.sponsors.co.join(', ')}
                          </>
                        )}
                      </p>
                    )}
                    {internalSection}
                  </div>
                ))}

              {/* STEP: Strategic Alignment (Director and sponsor) */}
              {isFlowView &&
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
                      strategySent
                        ? strategyApproved
                          ? 'The Strategy Team has approved this partnership.'
                          : 'Waiting for approval from the Strategy Team. Follow the reviewer below.'
                        : isDirector
                          ? 'Choose the Strategy Team reviewer, then send the request.'
                          : 'The Director has not sent this to the Strategy Team yet.',
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
                        stageChip(
                          strategyApproved ? 'approved' : strategyDeclined ? 'declined' : 'awaiting'
                        )
                      )
                    )}
                    {strategyConditions && strategyApproved && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex flex-col gap-1 -mt-2">
                        <span className="text-sm font-semibold text-emerald-800">
                          Approval: Proceed
                        </span>
                        <p className="text-sm text-emerald-900 leading-relaxed">
                          Conditions: {strategyConditions}
                        </p>
                      </div>
                    )}
                    {strategySection}
                  </div>
                ))}

              {/* STEP: NDA & Discovery */}
              {(isFlowView || isStrategyTeam) && activeStep === 'nda' && (
                <NdaDiscoveryStage
                  request={request}
                  role={isSponsor ? 'sponsor' : isStrategyTeam ? 'viewer' : 'director'}
                  onAction={(action) => onCaseAction?.(request.id, action)}
                  onNext={() => setActiveStep('value')}
                />
              )}

              {/* STEP: Value & Due Diligence */}
              {(isFlowView || isStrategyTeam) && activeStep === 'value' && (
                <ValueDueDiligenceStage
                  request={request}
                  role={isSponsor ? 'sponsor' : isStrategyTeam ? 'viewer' : 'director'}
                  onAction={(action) => onCaseAction?.(request.id, action)}
                />
              )}

              {/* STEP: Questionnaire (Internal Interest Team) */}
              {isInternalTeam && activeStep === 'questionnaire' && (
                <div
                  onFocusCapture={prefillQuestionnaire}
                  className="flex flex-col gap-6 w-full animate-in fade-in duration-150"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-semibold text-[#0d212c]">
                      {request.sentQuestionnaire?.name ?? 'Internal Evaluation Questionnaire'}
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      Answer the questions below to evaluate clinical need, pilot sponsorship, and
                      strategic feasibility.
                    </p>
                  </div>

                  <ReviewQuestionnaire
                    questions={reviewQuestions}
                    answers={questionAnswers}
                    onChange={patchAnswer}
                    readOnly={questionnaireSubmitted}
                    hideSubmit
                  />
                </div>
              )}

              {/* STEP: Pre-read summary (Strategy Team) */}
              {isStrategyTeam && activeStep === 'preread' && (
                <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
                  {preReadStage === 'upload' && (
                    <KnowledgeBaseUpload
                      files={kbFiles}
                      onFilesChange={setKbFiles}
                      onGenerate={() => setPreReadStage('generating')}
                    />
                  )}
                  {preReadStage === 'generating' && (
                    <ThinkingMode
                      inline
                      eyebrow="GENERATING"
                      description="The agent is comparing the vendor submission with the selected documents to prepare the pre-read summary."
                      messages={PRE_READ_CHECKS}
                      stepMs={1100}
                      onComplete={() => setPreReadStage('ready')}
                    />
                  )}
                  {preReadStage === 'ready' && (
                    <>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl font-semibold text-[#0d212c]">Pre-read summary</h2>
                          <p className="text-xs text-[#64748b]">
                            Generated by the agent from the vendor submission and the selected
                            documents.
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {strategyDone && (
                            <StatusChip
                              label={strategyOutcome === 'Reject' ? 'Rejected' : 'Proceeded'}
                              status={strategyOutcome === 'Reject' ? 'error' : 'success'}
                              dot={false}
                            />
                          )}
                        </div>
                      </div>
                      <PreReadSummary
                        request={request}
                        documents={(strategyMine?.documents ?? kbFiles.map((f) => f.name)).filter(
                          Boolean
                        )}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* TAB: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="animate-in fade-in duration-150">
            <AuditLog events={request.auditLog ?? []} />
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

      {/* DIRECTOR DECISION ON THE BRIEF */}
      {briefModal && (
        <BriefDecisionModal
          agentRecommendation={request.agentRecommendation?.status}
          email={buildInfoEmail(request, userProfile?.name ?? 'Director')}
          onSubmit={handleBriefDecision}
          onRequestInfo={handleSendInfo}
          onClose={() => setBriefModal(false)}
        />
      )}

      {/* ADMIN DECISION: proceed (type and optional reason) or reject (reason) */}
      {adminModal && (
        <AdminActionModal
          mode={adminModal}
          typeConfidence={getTypeConfidence(request)}
          initialType={
            adminModal !== 'reject' && previousRouting?.action === 'proceed'
              ? previousRouting.type
              : undefined
          }
          initialReason={previousRouting?.action === adminModal ? previousRouting.reason : ''}
          onConfirm={(routing) =>
            handleAdminConfirm(
              adminModal === 'reassign'
                ? { ...routing, reason: previousRouting?.reason ?? '' }
                : routing
            )
          }
          onClose={() => setAdminModal(null)}
        />
      )}

      {/* CONFIRM CHANGING AN EARLIER ROUTING (Partnership Admin) */}
      {pendingRouting && (
        <ConfirmDialog
          title="Are you sure you want to confirm?"
          description="Your changes will be saved and the request will follow the updated routing. You can go back to review them first."
          confirmLabel="Confirm"
          cancelLabel="Go back"
          icon={ArrowLeftRight}
          onCancel={() => setPendingRouting(null)}
          onConfirm={() => {
            onRoute?.(request.id, pendingRouting)
            setPendingRouting(null)
          }}
        />
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

      {/* INTERNAL INTEREST OUTCOMES: close the case, or assign the lead sponsor and co-sponsors */}
      {showNotReadyConfirm && (
        <ConfirmDialog
          title="Close this case?"
          description="No one from the Internal Interest team is ready to sponsor this request. Do you want to close this case? After your approval the case will be closed."
          confirmLabel="Close case"
          onCancel={() => setScenarioPrompt('dismissed')}
          onConfirm={() =>
            onCaseAction?.(request.id, {
              type: 'closeCase',
              reason: 'No one from the Internal Interest team is ready to sponsor this request.',
            })
          }
        />
      )}
      {showSponsorReady && (
        <ConfirmDialog
          title="Ready to sponsor"
          description={`${request.sponsors?.lead} is ready to sponsor this request. Moving to the Strategic Alignment stage.`}
          confirmLabel="Proceed"
          hideCancel
          onCancel={goToAlignment}
          onConfirm={goToAlignment}
        />
      )}
      {strategyAckOpen && (
        <ConfirmDialog
          title="Strategy team has proceeded"
          description="The Strategy team has reviewed the partnership and proceeded with the solution. Moving to the NDA stage."
          confirmLabel="Proceed"
          hideCancel
          onCancel={acknowledgeStrategy}
          onConfirm={acknowledgeStrategy}
        />
      )}
      {showSponsorAssign && (
        <SponsorAssignModal
          candidates={sponsorCandidates}
          onClose={() => setScenarioPrompt('dismissed')}
          onConfirm={({ lead, co }) => {
            onCaseAction?.(request.id, { type: 'assignSponsors', lead, co })
            setActiveStep('alignment')
          }}
        />
      )}

      {/* SEND TO INTERNAL INTEREST: reviewers and questions */}
      {sendTeam === 'internal' && (
        <SendInternalModal
          members={stakeholders}
          defaultNote={internalSendNote}
          onClose={() => setSendTeam(null)}
          onSend={({ memberIds, questionnaire }) => {
            const members = stakeholders.filter((m) => memberIds.includes(m.id))
            setStakeholders(members)
            onSendReview?.(request.id, 'internal', { members, questionnaire })
            setLocalSent((prev) => ({ ...prev, internal: true }))
            setSendTeam(null)
          }}
        />
      )}

      {/* SEND TO THE STRATEGY TEAM */}
      {sendTeam === 'strategy' && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-team-title"
            className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#36c0c9]/10 text-[#36c0c9] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 -rotate-12" />
                </div>
                <div>
                  <h3 id="send-team-title" className="text-lg font-semibold text-[#0d212c]">
                    Send to the Strategy Team
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    The reviewer is notified as soon as you send it.
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

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="text-sm font-semibold text-[#0d212c]">Strategy Team reviewer</h4>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Response due in 2-3 business days
                </span>
              </div>

              <ul className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
                {strategyMembers.map((person) => (
                  <li key={person.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
                        style={{
                          backgroundColor: person.avatarColorBg,
                          color: person.avatarColorText,
                        }}
                      >
                        {person.initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-[#0d212c] truncate">
                          {person.name}
                        </span>
                        <span className="text-[11px] text-[#64748b] truncate">{person.role}</span>
                      </div>
                    </div>
                    <span className="text-xs font-normal text-[#64748b] shrink-0 pl-2">
                      {person.expertise}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="send-note-strategy" className="text-xs font-medium text-[#0d212c]">
                  Note to Strategy Team
                </label>
                <textarea
                  id="send-note-strategy"
                  rows={9}
                  value={strategySendNote}
                  onChange={(e) => setStrategySendNote(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#e2e8f0] text-xs sm:text-sm text-[#0d212c] focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 bg-white leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] flex-wrap">
              <span className="text-xs text-[#64748b]">
                {strategyMembers.length === 0 ? 'Add a reviewer first.' : ''}
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
                  disabled={strategyMembers.length === 0}
                  onClick={() => {
                    onSendReview?.(request.id, 'strategy', { members: strategyMembers })
                    setLocalSent((prev) => ({ ...prev, strategy: true }))
                    setSendTeam(null)
                  }}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition ${
                    strategyMembers.length === 0
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

      {/* VIEW MEMBER RESPONSE POPUP MODAL */}
      {viewingResponseMember && (
        <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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
            {viewingResponseMember.answers ? (
              <ReviewQuestionnaire
                readOnly
                questions={viewingResponseMember.answers.map((a) => ({
                  id: a.questionId,
                  text: a.question,
                  cue: a.cue,
                  mandatory: true,
                }))}
                answers={Object.fromEntries(
                  viewingResponseMember.answers.map((a) => [a.questionId, { answer: a.answer }])
                )}
              />
            ) : viewingResponseMember.strategyResponse ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#475569]">Decision</span>
                    <StatusChip
                      label={
                        viewingResponseMember.strategyResponse.finalDecision === 'Reject'
                          ? 'Reject'
                          : 'Proceed'
                      }
                      status={
                        viewingResponseMember.strategyResponse.finalDecision === 'Reject'
                          ? 'error'
                          : 'success'
                      }
                      dot={false}
                    />
                  </div>
                  {viewingResponseMember.strategyResponse.finalDecisionNote && (
                    <p className="text-sm text-[#0d212c] leading-relaxed">
                      {viewingResponseMember.strategyResponse.finalDecisionNote}
                    </p>
                  )}
                </div>
                <PreReadSummary
                  request={request}
                  documents={viewingResponseMember.strategyResponse.documents}
                />
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

      {/* SUBMIT QUESTIONNAIRE CONFIRMATION */}
      {showQuestionnaireConfirmModal && (
        <ConfirmDialog
          title="Submit questionnaire?"
          description="Your answers go to the Director. After this you will not be able to edit them."
          confirmLabel="Submit"
          onCancel={() => setShowQuestionnaireConfirmModal(false)}
          onConfirm={handleConfirmSubmitQuestionnaire}
        />
      )}

      {/* STRATEGY DECISION: reason popup, then a confirmation before it is recorded */}
      {strategyModal && (
        <StrategyDecisionModal
          mode={strategyModal}
          onClose={() => setStrategyModal(null)}
          onConfirm={(reason) => {
            setPendingStrategy({
              decision: strategyModal === 'proceed' ? 'Proceed' : 'Reject',
              reason,
            })
            setStrategyModal(null)
          }}
        />
      )}
      {pendingStrategy && (
        <ConfirmDialog
          title="Submit your decision?"
          description="Your decision goes to the Director. After this you will not be able to change it."
          confirmLabel="Submit"
          onCancel={() => setPendingStrategy(null)}
          onConfirm={handleConfirmStrategyDecision}
        >
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b]">Your decision</span>
              <span className="font-semibold text-[#0d212c]">{pendingStrategy.decision}</span>
            </div>
            {pendingStrategy.reason && (
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
                <span className="text-[#64748b]">Reason</span>
                <p className="text-[#0d212c]">{pendingStrategy.reason}</p>
              </div>
            )}
          </div>
        </ConfirmDialog>
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

      {/* DIRECTOR: decision bar, always in view until the brief has a decision */}
      {isDirector && !briefSubmitted && activeTab !== 'audit' && activeStep === 'brief' && (
        <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-[#475569]">
            Review the brief, then record your decision.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBriefModal(true)}
              className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              Next
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* INTERNAL INTEREST: continue on the brief, always in view */}
      {isInternalTeam && activeTab !== 'audit' && activeStep === 'brief' && (
        <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-[#475569]">
            Review the brief, then continue to the questionnaire.
          </span>
          <button
            type="button"
            onClick={() => {
              completeStep('brief')
              setActiveStep('questionnaire')
            }}
            className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
          >
            Continue to Questionnaire
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* INTERNAL INTEREST: submit the questionnaire, disabled until it is complete */}
      {isInternalTeam &&
        activeTab !== 'audit' &&
        activeStep === 'questionnaire' &&
        !questionnaireSubmitted && (
          <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm text-[#475569]">
              Answer every mandatory question to submit.
            </span>
            <button
              type="button"
              disabled={!isQuestionnaireComplete(reviewQuestions, questionAnswers)}
              onClick={() => setShowQuestionnaireConfirmModal(true)}
              className="h-10 px-6 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              Submit
            </button>
          </div>
        )}

      {/* STRATEGY TEAM: Next on the brief, always in view */}
      {isStrategyTeam && activeTab !== 'audit' && activeStep === 'brief' && !strategyDone && (
        <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-[#475569]">
            Review the brief, then continue to prepare the pre-read summary.
          </span>
          <button
            type="button"
            onClick={() => {
              completeStep('brief')
              setActiveStep('preread')
            }}
            className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
          >
            Next
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* STRATEGY TEAM: decision bar, always in view once the pre-read is ready */}
      {isStrategyTeam &&
        activeTab !== 'audit' &&
        activeStep === 'preread' &&
        preReadStage === 'ready' &&
        !strategyDone && (
          <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm text-[#475569]">
              Review the pre-read, then record your decision.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStrategyModal('reject')}
                className="h-10 px-5 rounded-lg border border-red-500 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition flex items-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setStrategyModal('proceed')}
                className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                Proceed
              </button>
            </div>
          </div>
        )}

      {/* PARTNERSHIP ADMIN: decision bar, always in view so the action is obvious */}
      {isAdmin && activeStep === 'brief' && activeTab !== 'audit' && !previousRouting && (
        <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-2 px-6 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-[#475569]">
            Action required: decide where this case goes.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAdminModal('reject')}
              className="h-10 px-5 rounded-lg border border-red-500 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setAdminModal('proceed')}
              className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
