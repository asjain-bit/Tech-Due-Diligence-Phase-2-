import type { PartnershipRequest } from '@/types/partnership.types'
import type { AgentAction } from './AgentActions.types'

/** What the agent reads before it starts checking */
export const AGENT_CONTEXT_SOURCES = [
  'Intake case record',
  'Service line KPI baselines',
  'Digital strategy focus areas',
  'Solution and vendor estate',
  '24 months of pipeline history',
]

interface RequestProfile {
  route: string
  selfDeclaredRoute: string
  routeReason: string
  kpi: string
  kpiConfidence: number
  kpiWhy: string
  baseline: string
  coe: string
  estate: string
  commodityVerdict: string
  commodityIsRisk: boolean
  comparables: string
  differentiator: string
  changeFactors: [string, string, string]
}

const PROFILES: Record<string, RequestProfile> = {
  'req-001': {
    route: 'Partner',
    selfDeclaredRoute: 'Buy (licence the platform)',
    routeReason:
      'The vendor also asks for a clinical sandbox and joint research, which is a partnership, not a licence.',
    kpi: 'Time from scan to diagnosis',
    kpiConfidence: 91,
    kpiWhy:
      'The vendor claims earlier detection from imaging. Turnaround time is the KPI radiology and oncology already track.',
    baseline:
      'Median scan-to-report time is 26 hours today. We need three months of historical scans and reports at two sites to test the claim.',
    coe: 'No. Multi-modal imaging models would take the CoE well beyond the same window.',
    estate: 'No. The deployed estate has no pathology or imaging AI.',
    commodityVerdict: 'Hard to replace',
    commodityIsRisk: false,
    comparables:
      'Two regional imaging-AI vendors found. Neither covers pathology slides or clinical telemetry.',
    differentiator: 'One multi-modal engine across imaging, pathology and telemetry.',
    changeFactors: [
      'Clinical validation not reproduced on M42 patient data',
      'Regulatory documents found to be out of date or incomplete',
      'A reviewer finds an overlap with a planned roadmap item',
    ],
  },
  'req-002': {
    route: 'Partner',
    selfDeclaredRoute: 'Buy (licence the platform)',
    routeReason:
      'Only one live customer so far. A joint validation partnership fits better than a straight purchase.',
    kpi: 'Time to heart-failure detection',
    kpiConfidence: 82,
    kpiWhy:
      'The proposal targets automated detection in primary care. Days from first ECG to specialist referral is the closest measurable KPI.',
    baseline:
      'Median 9 days from first ECG to specialist referral. We need 14,000 labelled ECG records to test the accuracy claim.',
    coe: 'Partly. The CoE could build a basic ECG model in the same window, but not the echo Doppler support.',
    estate: 'Partly. An ECG module in the deployed estate covers basic reads only.',
    commodityVerdict: 'Partly replaceable',
    commodityIsRisk: true,
    comparables: 'ECG interpretation AI is widely available. Echo Doppler support is rarer.',
    differentiator: 'Transformer-based waveform model with cross-lead attention.',
    changeFactors: [
      'Regulatory status stays unconfirmed after the vendor is asked',
      'Accuracy falls below 94% on M42 ECG data',
      'The CoE shows it can match the model in the same window',
    ],
  },
  'req-003': {
    route: 'Buy',
    selfDeclaredRoute: 'Buy (licence the platform)',
    routeReason:
      'Cleared product with a mature commercial offer. The claim holds up, so licensing is the right route.',
    kpi: 'Rate of unclassified variants',
    kpiConfidence: 93,
    kpiWhy:
      'The product exists to resolve variants of unknown significance. That rate directly measures its value in rare-disease cases.',
    baseline:
      '38% of variants are unclassified today. We need 500 closed rare-disease cases to test the claim.',
    coe: 'No. A curated MENA variant database cannot be built inside the same window.',
    estate: 'No. No variant interpretation tool is deployed today.',
    commodityVerdict: 'Hard to replace',
    commodityIsRisk: false,
    comparables:
      'Several global variant tools exist. None hold a curated MENA-specific non-coding variant set.',
    differentiator: 'Largest curated MENA non-coding variant database.',
    changeFactors: [
      'Unclassified variant reduction is under 35% on M42 cases',
      'Patient data cannot stay in the UAE',
      'The vendor cannot match the stated sequencing throughput',
    ],
  },
  'req-004': {
    route: 'Partner',
    selfDeclaredRoute: 'Buy (licence the platform)',
    routeReason:
      'The vendor wants joint clinical pathways with M42 virtual health centres, which goes beyond a licence.',
    kpi: '30-day readmission rate',
    kpiConfidence: 89,
    kpiWhy:
      'Remote monitoring after discharge is meant to catch deterioration early. Readmission within 30 days is the standard outcome measure.',
    baseline:
      '30-day readmission is 14.2% today. We need discharge lists and 90-day readmissions for a 300-patient cohort.',
    coe: 'Partly. The CoE could build the escalation dashboard, but not the cellular hub.',
    estate: 'Partly. The estate already has a remote monitoring module for a smaller cohort.',
    commodityVerdict: 'Easy to replace',
    commodityIsRisk: true,
    comparables:
      'Remote monitoring hubs are offered by many vendors. Cellular zero-pairing is the main difference.',
    differentiator: 'Cellular hub that needs no smartphone or Wi-Fi at the patient home.',
    changeFactors: [
      'Readmissions drop by less than 2 points in the pilot',
      'The existing remote monitoring module can be extended at lower cost',
      'DoH licence or data security certification lapses',
    ],
  },
}

const FALLBACK: RequestProfile = {
  route: 'Partner',
  selfDeclaredRoute: 'Buy (licence the platform)',
  routeReason: 'The agent could not confirm the vendor claim, so it chose the safer route.',
  kpi: 'Primary clinical outcome KPI',
  kpiConfidence: 75,
  kpiWhy: 'The agent matched the proposal to the closest outcome KPI M42 already tracks.',
  baseline: 'The baseline needs to be measured at the pilot site before the test starts.',
  coe: 'Not assessed yet.',
  estate: 'Not assessed yet.',
  commodityVerdict: 'Needs review',
  commodityIsRisk: true,
  comparables: 'Comparable offerings not yet confirmed.',
  differentiator: 'To be confirmed with the vendor.',
  changeFactors: [
    'Vendor claims cannot be verified',
    'A reviewer finds a duplicate or roadmap overlap',
    'Baseline data cannot be obtained for the test',
  ],
}

const PHASE_BY_MATURITY: Record<string, string> = {
  Pilot: 'Phase 2: Pilot-ready',
  'Clinical Validation': 'Phase 2: Clinical validation',
  Commercial: 'Phase 3: Ready to scale',
}

const profileFor = (request: PartnershipRequest) => PROFILES[request.id] ?? FALLBACK

const confidenceLevel = (c: number) => (c >= 80 ? 'High' : c >= 50 ? 'Medium' : 'Low')

export const getChangeFactors = (request: PartnershipRequest): [string, string, string] =>
  profileFor(request).changeFactors

export const buildAgentActions = (request: PartnershipRequest): AgentAction[] => {
  const p = profileFor(request)
  const rec = request.agentRecommendation
  const recWord = rec?.status === 'reject' ? 'Reject' : 'Proceed'
  const recConfidence = rec?.confidence ?? 90
  const cards = request.overviewCards
  const duplicateClear = cards.duplicateCheck.toLowerCase() === 'clear'
  const regulatoryUnclear = cards.regulatory.toLowerCase().includes('unclear')
  const phase = PHASE_BY_MATURITY[request.solutionMaturity] ?? 'Phase 2: Pilot-ready'
  const info = request.companyInfo
  const people = request.internalInterests ?? []
  const spread = [2, -4, -9, -14, -18]

  return [
    {
      id: 'duplicate',
      icon: 'duplicate',
      title: 'Duplicate check',
      check: 'Against live cases, the deployed estate and prior declines',
      runningText: 'Comparing against live cases, the deployed estate and prior declines',
      status: duplicateClear ? 'passed' : 'attention',
      headline: duplicateClear
        ? 'No duplicate found'
        : 'Possible duplicate. Review before deciding',
      findings: [
        { label: 'Live cases compared', value: '24' },
        { label: 'Deployed estate solutions compared', value: '38' },
        { label: 'Prior declines compared', value: '12' },
        { label: 'Matches found', value: duplicateClear ? 'None' : '1 possible match' },
      ],
      output: duplicateClear
        ? `${request.companyName} and ${request.solution} do not match any live case, deployed solution or prior decline.`
        : `${request.companyName} resembles an existing case. Confirm it is not the same offering.`,
    },
    {
      id: 'classification',
      icon: 'classification',
      title: 'Classification',
      check: "Into one of four routes. The vendor's own label is treated as a claim",
      runningText: "Placing the request on a route and testing the vendor's own label",
      status: 'complete',
      headline: `Route: ${p.route}`,
      findings: [
        { label: 'Routes considered', value: 'Buy, Partner, Build with the Agentic CoE, Decline' },
        { label: 'Vendor self-declared', value: `${p.selfDeclaredRoute} (treated as a claim)` },
        { label: 'Agent classification', value: p.route },
        { label: 'Why', value: p.routeReason },
        { label: 'Focus area', value: request.focusArea },
      ],
      output: `Classified as ${p.route}. The vendor's label of "${p.selfDeclaredRoute}" was not accepted as given.`,
    },
    {
      id: 'maturity',
      icon: 'maturity',
      title: 'Maturity research',
      check: 'Evidence, deployment, regulatory, corporate, defensibility and duplication',
      runningText: 'Researching evidence, deployment, regulatory and corporate standing',
      status: regulatoryUnclear ? 'attention' : 'complete',
      headline: `${request.solutionMaturity}. ${phase}`,
      findings: [
        { label: 'Evidence', value: cards.evidence },
        { label: 'Deployment', value: cards.deployment },
        { label: 'Regulatory', value: cards.regulatory },
        {
          label: 'Corporate',
          value: `Founded ${info.yearFounded}${info.location ? `, ${info.location}` : ''}`,
        },
        { label: 'Defensibility', value: p.differentiator },
        { label: 'Duplication', value: duplicateClear ? 'No overlap found' : 'Possible overlap' },
        { label: 'Phase placement', value: phase },
      ],
      output: regulatoryUnclear
        ? `Placed in ${phase}, but regulatory status could not be confirmed. Ask the vendor for proof.`
        : `Vendor claims were checked against the evidence. Placed in ${phase}.`,
    },
    {
      id: 'kpi',
      icon: 'kpi',
      title: 'KPI mapping',
      check: 'Which service line KPIs the claim would move, and the baseline needed to test it',
      runningText: 'Matching the claim to service line KPIs and baselines',
      status: 'complete',
      confidence: p.kpiConfidence,
      headline: `${p.kpi}`,
      findings: [
        { label: 'KPI the claim would move', value: p.kpi },
        { label: 'Confidence', value: `${p.kpiConfidence}% (${confidenceLevel(p.kpiConfidence)})` },
        { label: 'Why this KPI', value: p.kpiWhy },
        { label: 'Baseline needed to test it', value: p.baseline },
      ],
      stakeholders: people.slice(0, 5).map((person, i) => ({
        name: person.name,
        role: person.role,
        reason: person.whySuggested ?? 'Relevant domain expertise.',
        confidence: Math.max(50, p.kpiConfidence + (spread[i] ?? -20)),
      })),
      output: `Mapped to "${p.kpi}" with ${confidenceLevel(p.kpiConfidence).toLowerCase()} confidence. The reviewers below are suggested for Internal Review.`,
    },
    {
      id: 'commodity',
      icon: 'commodity',
      title: 'Commodity test',
      check: 'Could the Agentic CoE or the existing estate deliver this inside the same window',
      runningText: 'Testing whether the CoE or the estate could deliver this in the same window',
      status: p.commodityIsRisk ? 'attention' : 'passed',
      headline: p.commodityVerdict,
      findings: [
        { label: 'Could the Agentic CoE deliver it?', value: p.coe },
        { label: 'Could the existing estate deliver it?', value: p.estate },
        { label: 'Comparable offerings', value: p.comparables },
        { label: 'What sets it apart', value: p.differentiator },
      ],
      output: p.commodityIsRisk
        ? `Partly replaceable. Value depends on: ${p.differentiator}`
        : `Not replaceable in the same window. Key difference: ${p.differentiator}`,
    },
    {
      id: 'brief',
      icon: 'brief',
      title: 'Initial assessment brief',
      check: 'Two pages, including the three things that would change its recommendation',
      runningText: 'Drafting the brief and the three things that would change the recommendation',
      status: recWord === 'Proceed' ? 'passed' : 'attention',
      confidence: recConfidence,
      headline: `Recommends ${recWord}`,
      findings: [
        { label: 'Recommendation', value: recWord },
        { label: 'Confidence', value: `${recConfidence}% (${confidenceLevel(recConfidence)})` },
        { label: 'Reasoning', value: rec?.rationale ?? 'See the brief.' },
        { label: 'Would change the recommendation', value: p.changeFactors.join('. ') },
      ],
      output: `Brief drafted. The agent recommends ${recWord.toLowerCase()}. The decision is yours.`,
    },
  ]
}
