import type { InternalInterestStakeholder, QuestionnaireQuestion } from '@/types/partnership.types'

export interface SendInternalPayload {
  memberIds: string[]
  questionnaire: { name: string; version: number; questions: QuestionnaireQuestion[] }
}

export interface SendInternalModalProps {
  members: InternalInterestStakeholder[]
  onSend: (payload: SendInternalPayload) => void
  onClose: () => void
}
