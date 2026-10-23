export interface StrategyDecisionModalProps {
  mode: 'proceed' | 'reject'
  /** Called with the reason (optional for proceed, mandatory for reject) */
  onConfirm: (reason: string) => void
  onClose: () => void
}
