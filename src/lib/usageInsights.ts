import type { PartnershipRequest } from '@/types/partnership.types'

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
  /** Tokens embedded from uploaded files, in millions */
  embeddingTokensM: number
  /** Web search credits used */
  searchCredits: number
}

export const USAGE_WEEKS: UsageWeek[] = [
  {
    short: 'Sep 28 – Oct 4',
    full: 'Sep 28 – Oct 4, 2026',
    calls: 14,
    tokensM: 13.6,
    embeddingTokensM: 6.2,
    searchCredits: 1900,
  },
  {
    short: 'Oct 5 – 11',
    full: 'Oct 5 – Oct 11, 2026',
    calls: 17,
    tokensM: 16.1,
    embeddingTokensM: 7.4,
    searchCredits: 2150,
  },
  {
    short: 'Oct 12 – 18',
    full: 'Oct 12 – Oct 18, 2026',
    calls: 20,
    tokensM: 18.6,
    embeddingTokensM: 9,
    searchCredits: 2400,
  },
  {
    short: 'Oct 19 – 25',
    full: 'Oct 19 – Oct 25, 2026',
    calls: 22,
    tokensM: 20.4,
    embeddingTokensM: 9.8,
    searchCredits: 2650,
  },
  {
    short: 'Oct 26 – Nov 1',
    full: 'Oct 26 – Nov 1, 2026',
    calls: 19,
    tokensM: 17.5,
    embeddingTokensM: 8.5,
    searchCredits: 2300,
  },
]

export const DEFAULT_WEEK_INDEX = 2

export interface UsageAssumptions {
  hoursPerAssessment: number
  costPerHour: number
  inputTokenPrice: number
  outputTokenPrice: number
  /** Price per 1M tokens embedded from uploaded files */
  embeddingTokenPrice: number
  /** Price of one web search credit */
  searchCreditPrice: number
}

export const DEFAULT_ASSUMPTIONS: UsageAssumptions = {
  hoursPerAssessment: 6,
  costPerHour: 35,
  inputTokenPrice: 1.25,
  outputTokenPrice: 10,
  embeddingTokenPrice: 0.13,
  searchCreditPrice: 0.008,
}

/** Share of all model tokens that are input; the rest are output */
const INPUT_SHARE = 6 / 18.6

export const manualCost = (week: UsageWeek, a: UsageAssumptions) =>
  week.calls * a.hoursPerAssessment * a.costPerHour

/** Model tokens at the input and output prices, plus embeddings of uploaded files and web search */
export const aiCost = (week: UsageWeek, a: UsageAssumptions) =>
  week.tokensM * (INPUT_SHARE * a.inputTokenPrice + (1 - INPUT_SHARE) * a.outputTokenPrice) +
  week.embeddingTokensM * a.embeddingTokenPrice +
  week.searchCredits * a.searchCreditPrice

export const formatUsd = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

export interface StatusItem {
  name: string
  /** The case ID, e.g. PR-122 */
  code: string
}

export type AssessmentStatus = 'Completed' | 'In Progress' | 'Closed'

/** The three groups on the Usage page, in order */
export const ASSESSMENT_STATUSES: AssessmentStatus[] = ['Completed', 'In Progress', 'Closed']

/**
 * Groups the cases by where they stand overall: Completed once the technical due diligence report
 * is in, Closed when the case ended, In Progress for everything still moving. Each item shows its case ID.
 */
export const groupAssessmentsByStatus = (
  requests: PartnershipRequest[]
): { title: AssessmentStatus; items: StatusItem[] }[] =>
  ASSESSMENT_STATUSES.map((title) => ({
    title,
    items: requests
      .filter((r) => r.queue !== 'admin')
      .filter((r) => {
        const closed = r.status === 'Closed' || r.status === 'Exited' || r.queue === 'closed'
        const status: AssessmentStatus = closed
          ? 'Closed'
          : r.value?.sponsoredOn
            ? 'Completed'
            : 'In Progress'
        return status === title
      })
      .map((r) => ({ name: r.companyName, code: r.requestCode })),
  }))
