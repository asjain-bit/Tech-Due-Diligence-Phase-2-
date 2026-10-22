import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface AddQuestionModalProps {
  onSave: (question: Omit<QuestionnaireQuestion, 'id'>) => void
  onClose: () => void
}
