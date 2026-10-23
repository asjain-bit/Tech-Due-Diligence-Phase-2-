import {
  DEFAULT_INTERNAL_INTERESTS,
  DEFAULT_STRATEGY_MEMBERS,
  type AuditEvent,
  type CaseType,
  type InternalInterestStakeholder,
  type InternalScenario,
  type PartnershipRequest,
  type QuestionAnswer,
  type QuestionnaireQuestion,
  type StrategyMemberResponse,
  type WorkflowStage,
} from '@/types/partnership.types'
import type { VendorFormValues } from '@/types/vendorForm'

const DIRECTOR_NAME = 'Zaid Al Ali'
const ADMIN_NAME = 'Nadia Al-Farsi'
const DIRECTOR_ACTOR = `${DIRECTOR_NAME} (Director)`
const ADMIN_ACTOR = `${ADMIN_NAME} (Partnership Admin)`
const INTERNAL_ACTOR = 'Mariam Al-Zaabi (Internal Interest)'
const STRATEGY_ACTOR = 'Omar Al-Hashemi (Strategy Team)'
const SPONSOR_NAME = 'Rashid Al-Nuaimi'
const SPONSOR_ACTOR = `${SPONSOR_NAME} (Sponsor)`
const AGENT_ACTOR = 'Triage Agent'

export const CASE_TYPE_OWNER: Record<CaseType, string> = {
  Partnership: DIRECTOR_NAME,
  Procure: 'Procurement team',
  'M&A': 'Corporate Development team',
}

const todayLabel = (date = new Date()) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/** 22 Oct 2026, 06:50 PM */
export const formatTimestamp = (date = new Date()) =>
  `${todayLabel(date)}, ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

export type AuditInput = Omit<AuditEvent, 'id' | 'timestamp'> & { key?: string }

/** Adds an event to the case's audit log. An event with an existing key is only logged once. */
export const appendAudit = (r: PartnershipRequest, event: AuditInput): PartnershipRequest => {
  const log = r.auditLog ?? []
  const { key, ...rest } = event
  const id = key ?? `${r.id}-${log.length + 1}-${Date.now()}`
  if (key && log.some((e) => e.id === key)) return r
  return { ...r, auditLog: [...log, { ...rest, id, timestamp: formatTimestamp() }] }
}

/** Where the case is right now, in one short label */
export const getStageLabel = (r: PartnershipRequest): string => {
  if (r.queue === 'admin') return 'Admin review'
  if (r.status === 'Information Requested') return 'Information requested'
  if (r.status === 'Closed') return 'Closed'
  if (r.queue === 'closed' || r.status === 'Exited') return 'Exited'
  if (r.queue === 'routed') {
    return r.caseType === 'Procure' ? 'Routed to Procurement' : 'Routed to Corporate Development'
  }
  return r.workflowStages.find((s) => s.status === 'in_progress')?.title ?? 'Submitted'
}

/** Director has made a decision, so the Partnership Admin can no longer change the type */
export const hasDirectorDecided = (r: PartnershipRequest) =>
  r.queue === 'director' &&
  (Boolean(r.decision) ||
    r.status === 'In Progress' ||
    r.status === 'At Risk' ||
    r.status === 'Closed' ||
    r.status === 'Exited')

const setStages = (
  stages: WorkflowStage[],
  completedUpTo: number,
  inProgressId?: number
): WorkflowStage[] =>
  stages.map((s) => {
    if (s.id <= completedUpTo) return { ...s, status: 'completed', subheading: 'Completed' }
    if (s.id === inProgressId) return { ...s, status: 'in_progress', subheading: 'In Progress' }
    return { ...s, status: 'not_started', subheading: 'Not Started' }
  })

/** Director approves the brief: the case moves on to the review stages */
export const proceedRequest = (r: PartnershipRequest, reason: string): PartnershipRequest =>
  appendAudit(
    {
      ...r,
      status: 'In Progress',
      workflowStages: r.workflowStages.map((stage) => {
        if (stage.id === 3) return { ...stage, status: 'completed', subheading: 'Completed' }
        if (stage.id === 4) return { ...stage, status: 'in_progress', subheading: 'In Progress' }
        return stage
      }),
      daysInStage: 0,
      decision: {
        status: 'proceeded',
        reason: reason || 'Approved to proceed to next stage.',
        date: 'Just now',
      },
    },
    {
      title: 'Approved to proceed',
      description: reason || 'Approved to proceed to the next stage.',
      actor: DIRECTOR_ACTOR,
      kind: 'approval',
    }
  )

export const rejectRequest = (r: PartnershipRequest, reason: string): PartnershipRequest =>
  appendAudit(
    {
      ...r,
      status: 'Exited',
      daysInStage: 0,
      decision: { status: 'rejected', reason, date: 'Just now' },
    },
    { title: 'Request rejected', description: reason, actor: DIRECTOR_ACTOR, kind: 'critical' }
  )

/** Starting point for the email the Director sends when more information is needed */
export const buildInfoEmail = (r: PartnershipRequest, senderName: string) => ({
  to: r.companyInfo.email,
  subject: `More information needed: ${r.requestCode} ${r.companyName}`,
  body: [
    `Hi ${r.companyInfo.name},`,
    '',
    `Thank you for your partnership request (${r.requestCode}) for "${r.solution}". Before we can take it forward, we need a little more information:`,
    '',
    '• [Describe the information you need]',
    '',
    'Please reply to this email with the details. Your request stays marked as Information Requested until we hear from you.',
    '',
    'Kind regards,',
    senderName,
    'Director, Partnerships',
    'M42',
  ].join('\n'),
})

/** Director asks the vendor for more information: the case waits until it arrives */
export const holdRequest = (
  r: PartnershipRequest,
  email: { to: string; subject: string; body: string }
): PartnershipRequest =>
  appendAudit(
    {
      ...r,
      status: 'Information Requested',
      daysInStage: 0,
      holdInfo: { requestedOn: todayLabel(), ...email },
    },
    {
      title: 'More information requested',
      description: `Email sent to ${email.to}: ${email.subject}`,
      actor: DIRECTOR_ACTOR,
      kind: 'user',
    }
  )

/** Vendor information has arrived: the case goes back to the Director's brief */
export const resumeRequest = (r: PartnershipRequest): PartnershipRequest => {
  const { holdInfo: _holdInfo, ...rest } = r
  void _holdInfo
  return appendAudit(
    { ...rest, status: 'Pending', daysInStage: 0 },
    {
      title: 'Vendor information received',
      description: 'The case is back with the Director.',
      actor: DIRECTOR_ACTOR,
      kind: 'user',
    }
  )
}

export interface AdminRouting {
  action: 'proceed' | 'reject'
  type?: CaseType
  reason: string
}

/** Partnership Admin routes the case. Only Partnership cases reach the Director. */
export const routeRequest = (r: PartnershipRequest, routing: AdminRouting): PartnershipRequest => {
  const adminDecision = {
    action: routing.action,
    type: routing.type,
    reason: routing.reason,
    date: 'Just now',
  }

  if (routing.action === 'reject') {
    return appendAudit(
      {
        ...r,
        adminDecision,
        caseType: undefined,
        queue: 'closed',
        status: 'Exited',
        owner: ADMIN_NAME,
        daysInStage: 0,
      },
      {
        title: 'Rejected by Partnership Admin',
        description: routing.reason,
        actor: ADMIN_ACTOR,
        kind: 'critical',
      }
    )
  }

  const type = routing.type ?? 'Partnership'
  const reason = routing.reason || 'No reason added.'
  if (type === 'Partnership') {
    return appendAudit(
      {
        ...r,
        adminDecision,
        caseType: type,
        queue: 'director',
        status: 'Pending',
        owner: DIRECTOR_NAME,
        daysInStage: 0,
        workflowStages: setStages(r.workflowStages, 2, 3),
      },
      {
        title: 'Routed as Partnership',
        description: `Sent to the Director. ${reason}`,
        actor: ADMIN_ACTOR,
        kind: 'approval',
      }
    )
  }

  return appendAudit(
    {
      ...r,
      adminDecision,
      caseType: type,
      queue: 'routed',
      status: 'In Progress',
      owner: CASE_TYPE_OWNER[type],
      daysInStage: 0,
      workflowStages: setStages(r.workflowStages, 2, 3),
    },
    {
      title: `Routed as ${type}`,
      description: `Not in the Director's list. ${reason}`,
      actor: ADMIN_ACTOR,
      kind: 'approval',
    }
  )
}

type ReviewTeam = 'internal' | 'strategy'

/** Director sends a review request: reviewers are notified and the stage waits for approval */
export const sendReview = (
  r: PartnershipRequest,
  team: ReviewTeam,
  payload: {
    members: InternalInterestStakeholder[]
    questionnaire?: { name: string; questions: QuestionnaireQuestion[] }
  }
): PartnershipRequest => {
  const members = payload.members.map((m) => ({
    ...m,
    status: 'Pending',
    deadline: team === 'internal' ? '4 days' : '2-3 days',
    decision: '-',
    sponsor: undefined,
    responseDate: undefined,
    answers: undefined,
    strategyResponse: undefined,
  }))
  const next: PartnershipRequest = {
    ...r,
    sent: { ...r.sent, [team]: true },
    daysInStage: 0,
    ...(team === 'internal'
      ? { internalInterests: members, sentQuestionnaire: payload.questionnaire }
      : { strategyTeamMembers: members }),
  }
  return appendAudit(next, {
    key: `${r.id}-sent-${team}`,
    title:
      team === 'internal'
        ? 'Request sent to Internal Interest team'
        : 'Request sent to Strategy Team',
    description:
      team === 'internal'
        ? `${members.length} ${members.length === 1 ? 'reviewer' : 'reviewers'} asked to answer ${
            payload.questionnaire?.questions.length ?? 0
          } questions.`
        : `${members.length} ${members.length === 1 ? 'reviewer' : 'reviewers'} asked to review the pre-read summary.`,
    actor: DIRECTOR_ACTOR,
    kind: 'user',
  })
}

/** A reviewing team answers: the answer is recorded and counts as that stage's approval */
export const submitReview = (
  r: PartnershipRequest,
  team: ReviewTeam,
  payload: { answers?: QuestionAnswer[]; response?: StrategyMemberResponse }
): PartnershipRequest => {
  if (team === 'internal') {
    const people = r.internalInterests?.length ? r.internalInterests : DEFAULT_INTERNAL_INTERESTS
    const answers = payload.answers ?? []
    return appendAudit(
      {
        ...r,
        internalInterests: people.map((m, i) =>
          i === 0
            ? {
                ...m,
                status: 'Completed',
                decision: 'Proceed',
                sponsor: 'Yes',
                responseDate: todayLabel(),
                answers,
              }
            : m
        ),
        sponsors: r.sponsors ?? { lead: people[0].name, co: [] },
        stageApprovals: {
          ...r.stageApprovals,
          internal: { status: 'approved', by: 'Mariam Al-Zaabi', date: 'Just now' },
        },
      },
      {
        title: 'Internal Interest approved',
        description: `${answers.length} ${answers.length === 1 ? 'question' : 'questions'} answered.`,
        actor: INTERNAL_ACTOR,
        kind: 'approval',
      }
    )
  }

  const response = payload.response ?? {}
  const declined = response.finalDecision === 'Reject'
  const people = r.strategyTeamMembers?.length
    ? r.strategyTeamMembers
    : DEFAULT_STRATEGY_MEMBERS.slice(0, 1)
  return appendAudit(
    {
      ...r,
      strategyTeamMembers: people.map((m, i) =>
        i === 0
          ? {
              ...m,
              status: 'Completed',
              decision: response.finalDecision,
              strategyResponse: response,
            }
          : m
      ),
      workflowStages: declined ? r.workflowStages : setStages(r.workflowStages, 3, 4),
      stageApprovals: {
        ...r.stageApprovals,
        strategy: {
          status: declined ? 'declined' : 'approved',
          by: 'Omar Al-Hashemi',
          date: 'Just now',
        },
      },
    },
    {
      title: declined ? 'Strategy Team declined' : 'Strategy Team approved',
      description: response.finalDecision ?? 'Decision submitted.',
      actor: STRATEGY_ACTOR,
      kind: declined ? 'critical' : 'approval',
    }
  )
}

export const nextCaseCode = (requests: PartnershipRequest[]) => {
  const highest = requests.reduce((max, r) => {
    const n = Number(r.requestCode.replace(/\D/g, ''))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return `PR-${highest + 1}`
}

const inferMaturity = (text: string) => {
  const t = text.toLowerCase()
  if (/commercial|fully deployed|live customers|scaled/.test(t)) return 'Commercial'
  if (/validat|trial|study/.test(t)) return 'Clinical Validation'
  if (/pilot/.test(t)) return 'Pilot'
  return 'Concept'
}

const parseApprovals = (text: string) => {
  const found = ['FDA', 'CE', 'ISO', 'UAE MOHAP', 'DoH'].filter((a) =>
    new RegExp(`\\b${a.replace(' ', '\\s')}\\b`, 'i').test(text)
  )
  return found.length > 0 ? found : ['Not applicable']
}

const summarise = (text: string, max = 110) => {
  const first = text.trim().split(/(?<=[.!?])\s/)[0]
  return first.length > max ? `${first.slice(0, max - 1).trimEnd()}…` : first
}

/** Turns a submitted vendor form into a new case waiting for the Partnership Admin */
export const buildCaseFromForm = (
  values: VendorFormValues,
  code: string,
  now = new Date()
): PartnershipRequest => {
  const submittedOn = todayLabel(now)
  const deadline = todayLabel(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000))
  const solution = summarise(values.proposal)
  const maturity = inferMaturity(values.maturityAndRegulatory)

  return {
    id: `req-${code.toLowerCase().replace(/\D/g, '')}-${now.getTime()}`,
    requestCode: code,
    queue: 'admin',
    daysInStage: 0,
    owner: ADMIN_NAME,
    slaStatus: 'On track',
    companyName: values.company.trim(),
    vendorName: values.name.trim(),
    referredBy: null,
    solution,
    headline: solution,
    focusArea: values.focusAreas[0] ?? 'General',
    solutionMaturity: maturity,
    status: 'Pending',
    submittedOn,
    deadline,
    submittedRelative: 'Just now',
    tags: values.focusAreas,
    agentRecommendation: {
      status: 'proceed',
      label: 'Recommended to Proceed',
      confidence: 72,
      rationale:
        'The submission is complete and aligns with M42 focus areas. Regulatory evidence and baselines still need to be confirmed.',
    },
    workflowStages: [
      { id: 1, title: 'Submission', subheading: submittedOn, status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'In Progress', status: 'in_progress' },
      { id: 3, title: 'Screening & Fit', subheading: 'Not Started', status: 'not_started' },
      { id: 4, title: 'NDA & Discovery', subheading: 'Not Started', status: 'not_started' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Not yet assessed',
      deployment: 'Not yet assessed',
      regulatory: values.relevantApprovals.trim() || 'Not provided',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: `${values.company.trim()} — ${solution}`,
      sowDeadline: deadline,
      tokenConsumption: '0',
    },
    uploadedDocuments: [],
    auditLog: [
      {
        id: `${code}-submitted`,
        title: 'Partnership request submitted',
        description: `Vendor form received from ${values.company.trim()}.`,
        actor: `${values.name.trim()} (Vendor)`,
        kind: 'user',
        timestamp: formatTimestamp(now),
      },
    ],
    companyInfo: {
      name: values.name.trim(),
      jobTitle: values.jobTitle.trim(),
      company: values.company.trim(),
      phoneNumber: values.phone.trim() || undefined,
      email: values.email.trim(),
      yearFounded: values.yearFounded.trim(),
    },
    assessmentAreas: {
      stageOfMaturityAndExperience: values.stageAndExperience.trim(),
      proposalOfCollaboration: values.proposal.trim(),
      productPlatformServiceDetails: values.proposal.trim(),
      focusAreas: values.focusAreas,
      solutionMaturityLevelAndRegulatory: values.maturityAndRegulatory.trim(),
      relevantApprovals: values.relevantApprovals.trim(),
      regulatoryApprovalList: parseApprovals(values.relevantApprovals),
      noveltyAndDifferentiation: values.novelty.trim(),
      developmentApproach: values.developmentApproach || undefined,
      requestedM42Resources: values.resources.trim(),
      impactedPatientPopulations: values.populations,
    },
  }
}

/* ---------- Internal Interest outcome, sponsors and closing a case ---------- */

/** Closes a case that was already approved at the brief, with the reason recorded */
export const closeRequest = (r: PartnershipRequest, reason: string): PartnershipRequest =>
  appendAudit(
    { ...r, status: 'Closed', daysInStage: 0, closedReason: reason },
    { title: 'Case closed', description: reason, actor: DIRECTOR_ACTOR, kind: 'critical' }
  )

const approveInternal = (r: PartnershipRequest, sponsors: { lead: string; co: string[] }) =>
  appendAudit(
    {
      ...r,
      sponsors,
      stageApprovals: {
        ...r.stageApprovals,
        internal: { status: 'approved', by: sponsors.lead, date: 'Just now' },
      },
    },
    {
      title: 'Internal Interest approved',
      description:
        sponsors.co.length > 0
          ? `${sponsors.lead} is lead sponsor with ${sponsors.co.join(', ')} as co-sponsors.`
          : `${sponsors.lead} is ready to sponsor.`,
      actor: INTERNAL_ACTOR,
      kind: 'approval',
    }
  )

/**
 * Prototype only: simulates how the Internal Interest team responded, so every outcome can be
 * walked through. The real application would take this from the reviewers' answers.
 */
export const applyInternalScenario = (
  r: PartnershipRequest,
  scenario: InternalScenario
): PartnershipRequest => {
  const people = r.internalInterests?.length ? r.internalInterests : DEFAULT_INTERNAL_INTERESTS
  const ready = scenario === 'single' ? 1 : scenario === 'multiple' ? 3 : 0
  const answered = scenario === 'none' ? 0 : scenario === 'not-ready' ? 2 : ready + 1
  const date = todayLabel()
  const members = people.map((m, i) => {
    if (i >= answered) {
      return { ...m, status: 'Pending', decision: '-', sponsor: undefined, responseDate: undefined }
    }
    return {
      ...m,
      status: 'Completed',
      // Someone can be interested, or not, without being ready to sponsor
      decision: i === 1 && scenario === 'not-ready' ? 'Reject' : 'Proceed',
      sponsor: i < ready ? ('Yes' as const) : ('No' as const),
      responseDate: date,
    }
  })
  // Picking another outcome re-opens a case an earlier outcome had closed
  const base: PartnershipRequest = {
    ...r,
    status: r.status === 'Closed' ? 'In Progress' : r.status,
    closedReason: undefined,
    internalInterests: members,
    internalOutcome: { scenario },
    sponsors: undefined,
    stageApprovals: { ...r.stageApprovals, internal: undefined },
  }
  if (scenario === 'none') {
    return closeRequest(base, 'No one from the Internal Interest team responded.')
  }
  if (scenario === 'single') {
    return approveInternal(base, { lead: members[0].name, co: [] })
  }
  return appendAudit(base, {
    title: 'Internal Interest responded',
    description:
      scenario === 'not-ready'
        ? '2 reviewers responded; none is ready to sponsor.'
        : '3 reviewers are ready to sponsor.',
    actor: INTERNAL_ACTOR,
    kind: 'user',
  })
}

export const assignSponsors = (
  r: PartnershipRequest,
  sponsors: { lead: string; co: string[] }
): PartnershipRequest => approveInternal(r, sponsors)

/* ---------- NDA & Discovery ---------- */

/** Director uploads a signed NDA copy. The first one generates the alignment pack. */
export const uploadSignedNda = (r: PartnershipRequest, fileName: string): PartnershipRequest => {
  const versions = r.nda?.versions ?? []
  const version = versions.length + 1
  const withNda: PartnershipRequest = {
    ...r,
    nda: {
      versions: [
        ...versions,
        { version, fileName, uploadedOn: todayLabel(), uploadedBy: DIRECTOR_NAME },
      ],
    },
  }
  const logged = appendAudit(withNda, {
    title: version === 1 ? 'Signed NDA uploaded' : `NDA version ${version} uploaded`,
    description: fileName,
    actor: DIRECTOR_ACTOR,
    kind: 'approval',
  })
  if (version > 1) return logged
  return appendAudit(
    {
      ...logged,
      alignmentPackOn: todayLabel(),
      daysInStage: 0,
      workflowStages: setStages(r.workflowStages, 4, 5),
    },
    {
      title: 'Alignment pack generated',
      description:
        'Brief, interest summary and strategy assessment merged with open questions. Sent to the Director, sponsors and the Strategy Team.',
      actor: AGENT_ACTOR,
      kind: 'agent',
    }
  )
}

export const addDiscoveryFile = (
  r: PartnershipRequest,
  kind: 'notes' | 'recordings',
  name: string
): PartnershipRequest => {
  const discovery = r.discovery ?? { notes: [], recordings: [] }
  return appendAudit(
    {
      ...r,
      discovery: {
        ...discovery,
        [kind]: [...discovery[kind], { name, uploadedOn: todayLabel(), uploadedBy: SPONSOR_NAME }],
      },
    },
    {
      title: kind === 'notes' ? 'Discovery notes uploaded' : 'Discovery recording uploaded',
      description: name,
      actor: SPONSOR_ACTOR,
      kind: 'user',
    }
  )
}

export const confirmDiscoveryCall = (r: PartnershipRequest): PartnershipRequest =>
  appendAudit(
    {
      ...r,
      daysInStage: 0,
      discovery: { notes: [], recordings: [], ...r.discovery, confirmedOn: todayLabel() },
      workflowStages: setStages(r.workflowStages, 4, 5),
    },
    {
      title: 'Discovery call confirmed',
      description: 'The discovery call has taken place.',
      actor: SPONSOR_ACTOR,
      kind: 'user',
    }
  )

/* ---------- Value & Due Diligence ---------- */

export const confirmValueCall = (r: PartnershipRequest): PartnershipRequest =>
  appendAudit(
    { ...r, value: { ...r.value, callConfirmedOn: todayLabel() } },
    {
      title: 'Value assessment call confirmed',
      description: 'The value assessment call has taken place.',
      actor: SPONSOR_ACTOR,
      kind: 'user',
    }
  )

export const uploadBusinessCase = (r: PartnershipRequest, name: string): PartnershipRequest =>
  appendAudit(
    {
      ...r,
      value: {
        ...r.value,
        businessCase: { name, uploadedOn: todayLabel(), uploadedBy: SPONSOR_NAME },
      },
    },
    { title: 'Business case uploaded', description: name, actor: SPONSOR_ACTOR, kind: 'user' }
  )

/** The sponsor's call on the business case. Proceed moves to due diligence, reject closes the case. */
export const decideValue = (
  r: PartnershipRequest,
  status: 'proceeded' | 'rejected',
  reason: string
): PartnershipRequest => {
  const decision = { status, reason: reason || undefined, date: todayLabel() }
  const next: PartnershipRequest = { ...r, value: { ...r.value, decision } }
  if (status === 'rejected') {
    return appendAudit(
      {
        ...next,
        status: 'Closed',
        daysInStage: 0,
        closedReason: reason || 'Rejected by the sponsor.',
      },
      {
        title: 'Business case rejected',
        description: reason,
        actor: SPONSOR_ACTOR,
        kind: 'critical',
      }
    )
  }
  return appendAudit(
    { ...next, daysInStage: 0, workflowStages: setStages(r.workflowStages, 5, 6) },
    {
      title: 'Business case approved',
      description: reason || 'The sponsor chose to proceed to due diligence.',
      actor: SPONSOR_ACTOR,
      kind: 'approval',
    }
  )
}

export const generateTddReport = (r: PartnershipRequest): PartnershipRequest =>
  r.value?.tddGeneratedOn
    ? r
    : appendAudit(
        {
          ...r,
          value: { ...r.value, tddGeneratedOn: todayLabel() },
          workflowStages: setStages(r.workflowStages, 6, 7),
        },
        {
          title: 'TDD report generated',
          description: 'Technical due diligence report ready for the Director and sponsors.',
          actor: AGENT_ACTOR,
          kind: 'agent',
        }
      )

/** Every change the late stages and the Internal Interest outcome can make to a case */
export type CaseAction =
  | { type: 'internalScenario'; scenario: InternalScenario }
  | { type: 'closeCase'; reason: string }
  | { type: 'assignSponsors'; lead: string; co: string[] }
  | { type: 'uploadNda'; fileName: string }
  | { type: 'discoveryFile'; kind: 'notes' | 'recordings'; name: string }
  | { type: 'confirmDiscovery' }
  | { type: 'confirmValueCall' }
  | { type: 'businessCase'; name: string }
  | { type: 'valueDecision'; status: 'proceeded' | 'rejected'; reason: string }
  | { type: 'generateTdd' }

export const applyCaseAction = (r: PartnershipRequest, action: CaseAction): PartnershipRequest => {
  switch (action.type) {
    case 'internalScenario':
      return applyInternalScenario(r, action.scenario)
    case 'closeCase':
      return closeRequest(r, action.reason)
    case 'assignSponsors':
      return assignSponsors(r, { lead: action.lead, co: action.co })
    case 'uploadNda':
      return uploadSignedNda(r, action.fileName)
    case 'discoveryFile':
      return addDiscoveryFile(r, action.kind, action.name)
    case 'confirmDiscovery':
      return confirmDiscoveryCall(r)
    case 'confirmValueCall':
      return confirmValueCall(r)
    case 'businessCase':
      return uploadBusinessCase(r, action.name)
    case 'valueDecision':
      return decideValue(r, action.status, action.reason)
    case 'generateTdd':
      return generateTddReport(r)
  }
}
