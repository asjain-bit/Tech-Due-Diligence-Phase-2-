import type { CaseType, PartnershipRequest, WorkflowStage } from '@/types/partnership.types'
import type { VendorFormValues } from '@/types/vendorForm'

const DIRECTOR_NAME = 'Zaid Al Ali'
const ADMIN_NAME = 'Nadia Al-Farsi'

export const CASE_TYPE_OWNER: Record<CaseType, string> = {
  Partnership: DIRECTOR_NAME,
  Procure: 'Procurement team',
  'M&A': 'Corporate Development team',
}

const todayLabel = (date = new Date()) =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

/** Where the case is right now, in one short label */
export const getStageLabel = (r: PartnershipRequest): string => {
  if (r.queue === 'admin') return 'Admin review'
  if (r.status === 'On Hold') return 'On hold'
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

/** Director approves the brief: the case moves on to the review steps */
export const proceedRequest = (r: PartnershipRequest, reason: string): PartnershipRequest => ({
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
})

export const rejectRequest = (r: PartnershipRequest, reason: string): PartnershipRequest => ({
  ...r,
  status: 'Exited',
  daysInStage: 0,
  decision: { status: 'rejected', reason, date: 'Just now' },
})

/** Director asks the vendor for more information: the case waits until it arrives */
export const holdRequest = (
  r: PartnershipRequest,
  email: { to: string; subject: string; body: string }
): PartnershipRequest => ({
  ...r,
  status: 'On Hold',
  daysInStage: 0,
  holdInfo: { requestedOn: todayLabel(), ...email },
})

/** Vendor information has arrived: the case goes back to the Director's brief */
export const resumeRequest = (r: PartnershipRequest): PartnershipRequest => {
  const { holdInfo: _holdInfo, ...rest } = r
  void _holdInfo
  return { ...rest, status: 'Pending', daysInStage: 0 }
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
    return {
      ...r,
      adminDecision,
      caseType: undefined,
      queue: 'closed',
      status: 'Exited',
      owner: ADMIN_NAME,
      daysInStage: 0,
    }
  }

  const type = routing.type ?? 'Partnership'
  if (type === 'Partnership') {
    return {
      ...r,
      adminDecision,
      caseType: type,
      queue: 'director',
      status: 'Pending',
      owner: DIRECTOR_NAME,
      daysInStage: 0,
      workflowStages: setStages(r.workflowStages, 2, 3),
    }
  }

  return {
    ...r,
    adminDecision,
    caseType: type,
    queue: 'routed',
    status: 'In Progress',
    owner: CASE_TYPE_OWNER[type],
    daysInStage: 0,
    workflowStages: setStages(r.workflowStages, 2, 3),
  }
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
