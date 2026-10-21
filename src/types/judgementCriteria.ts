export interface JudgementCriterion {
  id: string
  title: string
  options: string[]
  /** Value the agent pre-fills */
  agentValue: string
  /** Plain-language reason the agent picked its value */
  agentRationale: string
  /** Where in the submission / research the agent found the evidence */
  agentSource: string
}

export const JUDGEMENT_CRITERIA: JudgementCriterion[] = [
  {
    id: 'focus_areas',
    title: 'Fit to current focus areas',
    options: ['In scope', 'Adjacent', 'Out of scope'],
    agentValue: 'In scope',
    agentRationale:
      'The solution targets "Clinical decision support" and "Patient safety analytics". Both are active M42 focus areas, so no exception is needed.',
    agentSource: 'Vendor submission, Focus Area and Proposal of Collaboration',
  },
  {
    id: 'roadmap',
    title: 'Duplication on the roadmap',
    options: ['None', 'Overlap a roadmap item', 'Duplicates a roadmap item'],
    agentValue: 'Overlap a roadmap item',
    agentRationale:
      'The M42 roadmap already lists "Deterioration alerts in the EMR" for 2027. The vendor covers part of that scope but also adds imaging, so it overlaps rather than duplicates.',
    agentSource: 'Internal roadmap register, Duplicate Check',
  },
  {
    id: 'build_buy',
    title: 'Build, buy or partner',
    options: ['Partner', 'Buy', 'Build'],
    agentValue: 'Build',
    agentRationale:
      'Strategy guidance lists predictive clinical models as "build" through the Agentic CoE. Buying or partnering would conflict with that stated direction.',
    agentSource: 'Technology strategy, capability sourcing guide',
  },
  {
    id: 'architecture',
    title: 'Architecture, hosting and data residency',
    options: ['Fits', 'Fits with conditions', 'Does not fit'],
    agentValue: 'Does not fit',
    agentRationale:
      'The vendor hosts patient data in the EU. The in-country residency rule requires it to stay in the UAE, and no UAE hosting option is offered today.',
    agentSource: 'Vendor submission, Development Approach and hosting details',
  },
  {
    id: 'own_rent',
    title: 'Own versus rent',
    options: ['Own', 'Rent', 'Mixed'],
    agentValue: 'Mixed',
    agentRationale:
      'The vendor proposes shared IP on a model trained with M42 data, while the base platform stays vendor-owned. That splits ownership between both sides.',
    agentSource: 'Vendor submission, Resources requested from M42',
  },
  {
    id: 'scale',
    title: 'Scale across the network',
    options: ['High', 'Medium', 'Low'],
    agentValue: 'High',
    agentRationale:
      'The solution would apply across all ICUs and wards in the network, not a single site, so the potential reach is high.',
    agentSource: 'Vendor submission, Target Patient Population & Impact',
  },
  {
    id: 'sovereignty',
    title: 'Sovereignty and local content',
    options: ['Meets', 'Partially meets', 'Does not meet'],
    agentValue: 'Partially meets',
    agentRationale:
      'The vendor has no UAE entity yet. One is promised within 12 months, but that is a claim and is not backed by a filing.',
    agentSource: 'Vendor submission, Company Information',
  },
]

export type StrategyDecision = 'Yes, proceed' | 'Proceed with a condition' | 'No'

export const STRATEGY_DECISION_OPTIONS: { value: StrategyDecision; hint: string }[] = [
  { value: 'Yes, proceed', hint: 'Strategic fit is clear. Move to the next stage.' },
  {
    value: 'Proceed with a condition',
    hint: 'Fit is acceptable if a specific condition is met.',
  },
  { value: 'No', hint: 'Not a strategic fit. Do not proceed.' },
]

export interface JudgementEntry {
  value: string
  /** Mandatory when value differs from the agent pre-fill */
  reason: string
}

export type JudgementEntries = Record<string, JudgementEntry>

export const buildInitialJudgementEntries = (): JudgementEntries =>
  Object.fromEntries(
    JUDGEMENT_CRITERIA.map((c) => [c.id, { value: c.agentValue, reason: '' } as JudgementEntry])
  )

export const isJudgementEdited = (criterion: JudgementCriterion, entry?: JudgementEntry) =>
  Boolean(entry) && entry!.value !== criterion.agentValue

/** Short, editable draft the agent writes for the final decision. */
export const buildStrategyDecisionDraft = (
  decision: StrategyDecision,
  entries: JudgementEntries
): string => {
  const concerns = JUDGEMENT_CRITERIA.filter((c) => {
    const v = entries[c.id]?.value
    return (
      v === 'Does not fit' ||
      v === 'Does not meet' ||
      v === 'Partially meets' ||
      v === 'Duplicates a roadmap item' ||
      v === 'Out of scope' ||
      v === 'Fits with conditions'
    )
  }).map((c) => c.title.toLowerCase())

  const concernText = concerns.length
    ? concerns.slice(0, 3).join(', ')
    : 'no material strategic concerns'

  if (decision === 'Yes, proceed') {
    return `Good fit with current focus areas and strong network reach. Open points to track: ${concernText}.`
  }
  if (decision === 'Proceed with a condition') {
    return `Proceed only if the vendor resolves: ${concernText}. Review again once these are confirmed in writing.`
  }
  return `Not a strategic fit at this stage. Main gaps: ${concernText}.`
}
