import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface QuestionAnswerValue {
  answer: string
}

export interface ReviewQuestionnaireProps {
  questions: QuestionnaireQuestion[]
  answers: Record<string, QuestionAnswerValue>
  onChange?: (questionId: string, patch: Partial<QuestionAnswerValue>) => void
  /** View-only mode: same layout, every field locked, no submit */
  readOnly?: boolean
  /** The page shows its own fixed submit bar, so this one is left out */
  hideSubmit?: boolean
  onSubmit?: () => void
  className?: string
}
