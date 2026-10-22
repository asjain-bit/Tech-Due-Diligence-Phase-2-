import type { InternalInterestStakeholder, QuestionnaireQuestion } from '@/types/partnership.types'

export interface SendInternalPayload {
  memberIds: string[]
  note: string
  questionnaire: { name: string; questions: QuestionnaireQuestion[] }
}

export interface SendInternalModalProps {
  members: InternalInterestStakeholder[]
  defaultNote: string
  onSend: (payload: SendInternalPayload) => void
  onClose: () => void
}
