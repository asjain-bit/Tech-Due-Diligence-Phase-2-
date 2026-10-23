/** Prototype data and maths behind the Usage Insights page */

export interface UsageWeek {
  /** Short axis label, e.g. "Oct 12 – 18" */
  short: string
  /** Full label for the selector and captions */
  full: string
  /** Assessment calls made that week */
  calls: number
  /** Tokens consumed, in millions */
  tokensM: number
}

export const USAGE_WEEKS: UsageWeek[] = [
  { short: 'Sep 28 – Oct 4', full: 'Sep 28 – Oct 4, 2026', calls: 14, tokensM: 13.6 },
  { short: 'Oct 5 – 11', full: 'Oct 5 – Oct 11, 2026', calls: 17, tokensM: 16.1 },
  { short: 'Oct 12 – 18', full: 'Oct 12 – Oct 18, 2026', calls: 20, tokensM: 18.6 },
  { short: 'Oct 19 – 25', full: 'Oct 19 – Oct 25, 2026', calls: 22, tokensM: 20.4 },
  { short: 'Oct 26 – Nov 1', full: 'Oct 26 – Nov 1, 2026', calls: 19, tokensM: 17.5 },
]

export const DEFAULT_WEEK_INDEX = 2

export interface UsageAssumptions {
  hoursPerAssessment: number
  costPerHour: number
  inputTokenPrice: number
  outputTokenPrice: number
  inputVoicePrice: number
  outputVoicePrice: number
}

export const DEFAULT_ASSUMPTIONS: UsageAssumptions = {
  hoursPerAssessment: 4,
  costPerHour: 30,
  inputTokenPrice: 1.25,
  outputTokenPrice: 10,
  inputVoicePrice: 10,
  outputVoicePrice: 20,
}

/** Share of all tokens by kind: text in, text out, voice in, voice out */
const TOKEN_MIX = {
  textIn: 4.8 / 18.6,
  textOut: 11.2 / 18.6,
  voiceIn: 1.2 / 18.6,
  voiceOut: 1.4 / 18.6,
}

export const manualCost = (week: UsageWeek, a: UsageAssumptions) =>
  week.calls * a.hoursPerAssessment * a.costPerHour

export const aiCost = (week: UsageWeek, a: UsageAssumptions) =>
  week.tokensM *
  (TOKEN_MIX.textIn * a.inputTokenPrice +
    TOKEN_MIX.textOut * a.outputTokenPrice +
    TOKEN_MIX.voiceIn * a.inputVoicePrice +
    TOKEN_MIX.voiceOut * a.outputVoicePrice)

export const formatUsd = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

export interface StatusItem {
  name: string
  stage: string
}

export const ASSESSMENTS_BY_STATUS: { title: string; items: StatusItem[] }[] = [
  {
    title: 'Completed',
    items: [
      { name: 'Cleveland Clinic Abu Dhabi | Clinical decision support', stage: 'Round 1' },
      { name: 'Danat Al Emarat Hospital | PACS integration', stage: 'Round 2' },
      { name: 'Healthpoint Hospital | Lab Telemedicine', stage: 'Initial Review' },
      { name: 'Imperial College London Diabetes Centre', stage: 'Follow-up Audit' },
      { name: 'Burjeel Hospital | Radiology triage', stage: 'Round 1' },
      { name: 'NMC Healthcare | Remote monitoring', stage: 'Round 2' },
    ],
  },
  {
    title: 'Scheduled',
    items: [
      { name: 'Sheikh Shakhbout Medical City (SSMC)', stage: 'Stage 2 Audit' },
      { name: 'Medica Diagnostic Center | UAE Data residency', stage: 'Round 2 - Compliance' },
      { name: 'Cleveland Clinic Abu Dhabi | Third-party audit', stage: 'Round 1' },
      { name: 'Danat Al Emarat Hospital | Clinical safety', stage: 'Round 2' },
      { name: 'Mediclinic | Patient flow analytics', stage: 'Round 1' },
      { name: 'Zulekha Hospital | Pharmacy automation', stage: 'Stage 1 Audit' },
    ],
  },
  {
    title: 'Finalised',
    items: [
      { name: 'Moorfields Eye Hospital Abu Dhabi | Retinal AI', stage: 'Round 1 - Technical' },
      { name: 'M42 Genomic Sciences Center | Cohort analytics', stage: 'Stage 1 Discovery' },
      { name: 'Global Health Telemetry Unit | Bus integration', stage: 'Final Review' },
      { name: 'Healthpoint Hospital | ISO 27001 ISMS', stage: 'Final Signoff' },
      { name: 'Abu Dhabi Stem Cells Center | Registry', stage: 'Final Review' },
      { name: 'Diaverum | Dialysis scheduling', stage: 'Final Signoff' },
    ],
  },
]
