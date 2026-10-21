import type { PartnershipRequest } from '@/types/partnership.types'
import type { AgentAction } from './AgentActions.types'

interface RequestProfile {
  kpi: string
  kpiConfidence: number
  kpiWhy: string
  baseline: string
  test: string
  threshold: string
  dataNeeded: string
  commodityVerdict: string
  commodityIsRisk: boolean
  comparables: string
  differentiator: string
  solutionType: string
}

const PROFILES: Record<string, RequestProfile> = {
  'req-001': {
    kpi: 'Time from scan to diagnosis',
    kpiConfidence: 91,
    kpiWhy:
      'The vendor claims earlier detection from imaging. Turnaround time is the KPI hospitals already track for radiology and oncology.',
    baseline: 'Median scan-to-report time today is 26 hours across the pilot sites.',
    test: 'Re-read three months of historical scans at two M42 hospitals and compare the AI result with the radiologist report.',
    threshold: 'Sensitivity of at least 92% with no more than 10% false positives.',
    dataNeeded: 'De-identified DICOM scans and final radiology reports for 3 months.',
    commodityVerdict: 'Differentiated',
    commodityIsRisk: false,
    comparables:
      'Two regional imaging-AI vendors found. Neither covers pathology slides or clinical telemetry.',
    differentiator: 'One multi-modal engine across imaging, pathology and telemetry.',
    solutionType: 'AI software as a medical device (diagnostic support)',
  },
  'req-002': {
    kpi: 'Time to heart-failure detection',
    kpiConfidence: 82,
    kpiWhy:
      'The proposal targets automated detection in primary care. Days from first ECG to specialist referral is the closest measurable KPI.',
    baseline: 'Median 9 days from first ECG to specialist referral today.',
    test: 'Run the model on 14,000 retrospective regional ECG records and compare with cardiologist labels.',
    threshold: 'Accuracy of at least 94% and a 30% cut in false-positive referrals.',
    dataNeeded: '12-lead ECG waveforms with confirmed diagnoses from two ambulatory clinics.',
    commodityVerdict: 'Partly commodity',
    commodityIsRisk: true,
    comparables:
      'ECG interpretation AI is widely available from several vendors. Echo Doppler support is rarer.',
    differentiator: 'Transformer-based waveform model with cross-lead attention.',
    solutionType: 'AI software as a medical device (cardiology)',
  },
  'req-003': {
    kpi: 'Rate of unclassified variants',
    kpiConfidence: 93,
    kpiWhy:
      'The product exists to resolve variants of unknown significance. That rate is the direct measure of value for rare-disease cases.',
    baseline: '38% of variants in rare-disease cases are unclassified today.',
    test: 'Re-analyse 500 closed rare-disease cases and count variants now classified.',
    threshold: 'At least a 35% reduction in unclassified variants.',
    dataNeeded: 'Whole-genome and exome files with clinical reports for 500 closed cases.',
    commodityVerdict: 'Differentiated',
    commodityIsRisk: false,
    comparables:
      'Several global variant tools exist. None hold a curated MENA-specific non-coding variant set.',
    differentiator: 'Largest curated MENA non-coding variant database.',
    solutionType: 'Clinical bioinformatics platform (cleared device)',
  },
  'req-004': {
    kpi: '30-day readmission rate',
    kpiConfidence: 89,
    kpiWhy:
      'Remote monitoring after discharge is meant to catch deterioration early. Readmission within 30 days is the standard outcome measure.',
    baseline: '30-day readmission for chronic care patients is 14.2% today.',
    test: 'Enrol 300 discharged chronic care patients, half on remote monitoring, and compare readmissions over 90 days.',
    threshold: 'At least a 2-point drop in readmissions.',
    dataNeeded: 'Discharge lists and 90-day readmission records for the pilot cohort.',
    commodityVerdict: 'Commodity risk',
    commodityIsRisk: true,
    comparables:
      'Remote monitoring hubs are offered by many vendors. Cellular zero-pairing is the main difference.',
    differentiator: 'Cellular hub that needs no smartphone or Wi-Fi at the patient home.',
    solutionType: 'Connected devices plus clinical escalation dashboard',
  },
}

const FALLBACK: RequestProfile = {
  kpi: 'Primary clinical outcome KPI',
  kpiConfidence: 75,
  kpiWhy: 'The agent matched the proposal to the closest outcome KPI that M42 already tracks.',
  baseline: 'Baseline to be measured at the pilot site before the test starts.',
  test: 'Run a retrospective comparison on historical records at one M42 site.',
  threshold: 'Agreed with the sponsor before the pilot starts.',
  dataNeeded: 'De-identified records for the test period.',
  commodityVerdict: 'Needs review',
  commodityIsRisk: true,
  comparables: 'Comparable offerings not yet confirmed.',
  differentiator: 'To be confirmed with the vendor.',
  solutionType: 'Digital health solution',
}

const PHASE_BY_MATURITY: Record<string, string> = {
  Pilot: 'Phase 2: Pilot-ready',
  'Clinical Validation': 'Phase 2: Clinical validation',
  Commercial: 'Phase 3: Ready to scale',
}

const confidenceLevel = (c: number) => (c >= 80 ? 'High' : c >= 50 ? 'Medium' : 'Low')

export const buildAgentActions = (request: PartnershipRequest): AgentAction[] => {
  const p = PROFILES[request.id] ?? FALLBACK
  const rec = request.agentRecommendation
  const recWord = rec?.status === 'reject' ? 'Reject' : 'Proceed'
  const recConfidence = rec?.confidence ?? 90
  const cards = request.overviewCards
  const duplicateClear = cards.duplicateCheck.toLowerCase() === 'clear'
  const regulatoryUnclear = cards.regulatory.toLowerCase().includes('unclear')
  const phase = PHASE_BY_MATURITY[request.solutionMaturity] ?? 'Phase 2: Pilot-ready'
  const tags = request.tags ?? [request.focusArea]
  const people = request.internalInterests ?? []
  const confidences = [
    p.kpiConfidence + 2,
    p.kpiConfidence - 4,
    p.kpiConfidence - 9,
    p.kpiConfidence - 14,
    p.kpiConfidence - 18,
  ]

  return [
    {
      id: 'duplicate',
      title: 'Duplicate Check',
      check: 'Is this vendor or solution already in the pipeline, or already exited?',
      status: duplicateClear ? 'passed' : 'attention',
      headline: duplicateClear
        ? 'No duplicate found'
        : 'Possible duplicate. Review before deciding',
      findings: [
        { label: 'Active requests compared', value: '24' },
        { label: 'Similar active requests', value: duplicateClear ? '0' : '1' },
        { label: 'Previously exited requests compared', value: '12' },
        { label: 'Vendor seen before', value: 'No' },
      ],
      output: duplicateClear
        ? `${request.companyName} and ${request.solution} do not match any active or exited request.`
        : `${request.companyName} resembles an existing request. Confirm it is not the same offering.`,
    },
    {
      id: 'classification',
      title: 'Classification',
      check: 'Which focus area and solution type does this belong to?',
      status: 'complete',
      headline: `${request.focusArea}`,
      findings: [
        { label: 'Primary focus area', value: request.focusArea },
        {
          label: 'Secondary areas',
          value: tags.filter((t) => t !== request.focusArea).join(', ') || 'None',
        },
        { label: 'Solution type', value: p.solutionType },
        {
          label: 'Fit with M42 priorities',
          value: 'Aligned with transformation and innovation priorities',
        },
      ],
      output: `Classified under ${request.focusArea}. This sets which internal reviewers and judgement criteria apply.`,
    },
    {
      id: 'maturity',
      title: 'Maturity Research',
      check: 'How mature is the solution, and which phase should it enter?',
      status: regulatoryUnclear ? 'attention' : 'complete',
      headline: `${request.solutionMaturity}. Placed in ${phase}`,
      findings: [
        { label: 'Maturity claimed by vendor', value: request.solutionMaturity },
        { label: 'Evidence found', value: cards.evidence },
        { label: 'Deployment found', value: cards.deployment },
        { label: 'Regulatory status', value: cards.regulatory },
        { label: 'Phase placement', value: phase },
      ],
      output: regulatoryUnclear
        ? `Placed in ${phase}, but regulatory status could not be confirmed. Ask the vendor for proof.`
        : `Vendor claims were checked against the evidence. Placed in ${phase}.`,
    },
    {
      id: 'kpi',
      title: 'KPI Mapping',
      check: 'Which KPI would this move, and who inside M42 should weigh in?',
      status: 'complete',
      confidence: p.kpiConfidence,
      headline: `${p.kpi}. Matched ${Math.min(people.length, 5)} reviewers`,
      findings: [
        { label: 'Mapped KPI', value: p.kpi },
        { label: 'Why this KPI', value: p.kpiWhy },
      ],
      stakeholders: people.slice(0, 5).map((person, i) => ({
        name: person.name,
        role: person.role,
        reason: person.whySuggested ?? 'Relevant domain expertise.',
        confidence: confidences[i] ?? 60,
      })),
      output: `Mapped to "${p.kpi}" with ${confidenceLevel(p.kpiConfidence).toLowerCase()} confidence. Reviewers below are suggested for the Internal Interest step.`,
    },
    {
      id: 'baseline',
      title: 'Baseline Needed to Test',
      check: 'What must we measure first, and how would we test the claim?',
      status: 'complete',
      headline: p.baseline,
      findings: [
        { label: 'Baseline today', value: p.baseline },
        { label: 'Proposed test', value: p.test },
        { label: 'Data needed from M42', value: p.dataNeeded },
        { label: 'Pass threshold', value: p.threshold },
      ],
      output: `Test plan ready: ${p.test}`,
    },
    {
      id: 'commodity',
      title: 'Commodity Test',
      check: 'Is this easy to get elsewhere, or does it offer something different?',
      status: p.commodityIsRisk ? 'attention' : 'passed',
      headline: p.commodityVerdict,
      findings: [
        { label: 'Verdict', value: p.commodityVerdict },
        { label: 'Comparable offerings', value: p.comparables },
        { label: 'What sets it apart', value: p.differentiator },
      ],
      output: p.commodityIsRisk
        ? `Similar offerings exist. Value depends on: ${p.differentiator}`
        : `Hard to replace. Key difference: ${p.differentiator}`,
    },
    {
      id: 'brief',
      title: 'Assessment Brief',
      check: 'Putting it all together, should this move forward?',
      status: recWord === 'Proceed' ? 'passed' : 'attention',
      confidence: recConfidence,
      headline: `Recommends ${recWord}`,
      findings: [
        { label: 'Recommendation', value: recWord },
        { label: 'Confidence', value: `${recConfidence}% (${confidenceLevel(recConfidence)})` },
        { label: 'Reasoning', value: rec?.rationale ?? 'See recommendation above.' },
        {
          label: 'Open points for you',
          value:
            [
              regulatoryUnclear ? 'Regulatory status unconfirmed' : null,
              p.commodityIsRisk ? 'Value depends on differentiation' : null,
              !duplicateClear ? 'Possible duplicate' : null,
            ]
              .filter(Boolean)
              .join('. ') || 'None',
        },
      ],
      output: `Brief complete. The agent recommends you ${recWord.toLowerCase()}. The decision is yours.`,
    },
  ]
}
