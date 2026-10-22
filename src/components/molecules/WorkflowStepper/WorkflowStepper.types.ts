export type WorkflowStepState = 'completed' | 'current' | 'upcoming' | 'closed'

export interface WorkflowStep {
  id: string
  label: string
  state: WorkflowStepState
  /** Optional override for the line under the label */
  caption?: string
}

export interface WorkflowStepperProps {
  steps: WorkflowStep[]
  /** Step currently on screen */
  activeId: string
  /** Only completed and current steps can be selected */
  onSelect: (id: string) => void
  className?: string
}
