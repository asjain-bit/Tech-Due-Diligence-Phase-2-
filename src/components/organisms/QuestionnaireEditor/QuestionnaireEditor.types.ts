import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface QuestionnaireEditorProps {
  questionnaireId: string
  onQuestionnaireChange: (id: string) => void
  questions: QuestionnaireQuestion[]
  onQuestionsChange: (questions: QuestionnaireQuestion[]) => void
  className?: string
}
