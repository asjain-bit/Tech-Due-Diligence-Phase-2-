import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface QuestionAnswerValue {
  answer: string
  attachment?: string
}

export interface ReviewQuestionnaireProps {
  questions: QuestionnaireQuestion[]
  answers: Record<string, QuestionAnswerValue>
  onChange?: (questionId: string, patch: Partial<QuestionAnswerValue>) => void
  /** View-only mode: same layout, every field locked, no submit */
  readOnly?: boolean
  onSubmit?: () => void
  className?: string
}
