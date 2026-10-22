export type BriefDecisionChoice = 'approve' | 'reject' | 'request_info'

export interface BriefDecisionProps {
  /** What the agent recommended, used to hint the choice */
  agentRecommendation?: 'proceed' | 'reject'
  onSubmit: (decision: BriefDecisionChoice, reason: string) => void
  /** Once set the form is locked and shows the recorded decision */
  submitted?: { decision: BriefDecisionChoice; reason?: string }
  className?: string
}
