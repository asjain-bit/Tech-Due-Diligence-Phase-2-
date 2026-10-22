import type { BriefDecisionChoice } from '@/components/organisms/BriefDecision'

export interface BriefDecisionModalProps {
  /** Option selected when the popup opens */
  initialChoice: BriefDecisionChoice
  /** What the agent recommended, used to hint the choice */
  agentRecommendation?: 'proceed' | 'reject'
  onSubmit: (decision: BriefDecisionChoice, reason: string) => void
  onClose: () => void
}
