import type { QuestionnaireQuestion } from '@/types/partnership.types'

export interface QuestionnaireVersion {
  version: number
  /** What changed, e.g. "Edited question 2" */
  label: string
  questions: QuestionnaireQuestion[]
}

export interface QuestionnaireEditorProps {
  questionnaireId: string
  onQuestionnaireChange: (id: string) => void
  questions: QuestionnaireQuestion[]
  /** Called on every change with a short description used for the version history */
  onQuestionsChange: (questions: QuestionnaireQuestion[], label: string) => void
  /** Saved versions, oldest first. The last one is the current version. */
  versions?: QuestionnaireVersion[]
  /** Makes an earlier version the current one again (saved as a new version) */
  onRestore?: (version: number) => void
  className?: string
}
