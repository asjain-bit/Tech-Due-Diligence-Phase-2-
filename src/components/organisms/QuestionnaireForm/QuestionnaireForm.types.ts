export interface QuestionnaireValues {
  problem: string
  kpi: string
  baseline: string
  change: string
  sponsor: string
  budget: string
  sayNo: string
}

export interface QuestionnaireFormProps {
  values: QuestionnaireValues
  onChange?: (patch: Partial<QuestionnaireValues>) => void
  /** View-only mode: same layout, every field locked, no actions */
  readOnly?: boolean
  onSubmit?: () => void
  onCancel?: () => void
  className?: string
}
