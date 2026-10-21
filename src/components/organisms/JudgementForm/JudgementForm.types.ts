import type { JudgementEntries, JudgementEntry, StrategyDecision } from '@/types/judgementCriteria'

export interface JudgementFormProps {
  entries: JudgementEntries
  onEntryChange?: (criterionId: string, patch: Partial<JudgementEntry>) => void
  decision: StrategyDecision | null
  onDecisionChange?: (decision: StrategyDecision) => void
  decisionNote: string
  onDecisionNoteChange?: (note: string) => void
  /** View-only mode: same layout, every field locked, no submit */
  readOnly?: boolean
  onSubmit?: () => void
  className?: string
}
