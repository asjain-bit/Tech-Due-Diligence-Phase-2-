export type BriefDecisionChoice = 'approve' | 'reject'

export interface BriefDecisionProps {
  /** What the agent recommended, used to hint the choice */
  agentRecommendation?: 'proceed' | 'reject'
  onSubmit: (decision: BriefDecisionChoice, rationale: string) => void
  onBack?: () => void
  /** Once set the form is locked and shows the recorded decision */
  submitted?: { decision: BriefDecisionChoice; rationale?: string }
  className?: string
}
