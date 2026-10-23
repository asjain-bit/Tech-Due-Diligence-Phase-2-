import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface AddQuestionModalProps {
  /** When set the popup edits this question instead of adding a new one */
  initial?: Omit<QuestionnaireQuestion, 'id'>
  onSave: (question: Omit<QuestionnaireQuestion, 'id'>) => void
  onClose: () => void
}
