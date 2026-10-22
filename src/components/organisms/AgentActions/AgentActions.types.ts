import type { PartnershipRequest } from '@/types/partnership.types'

export type AgentActionStatus = 'passed' | 'attention' | 'complete'

export type AgentActionIcon =
  'duplicate' | 'classification' | 'maturity' | 'kpi' | 'commodity' | 'brief'

export interface AgentActionFinding {
  label: string
  value: string
}

export interface AgentActionStakeholder {
  name: string
  role: string
  reason: string
  confidence: number
}

export interface AgentAction {
  id: string
  icon: AgentActionIcon
  title: string
  /** What the agent was asked to check */
  check: string
  /** Shown while the check is running */
  runningText: string
  status: AgentActionStatus
  /** One-line result shown once the check is done */
  headline: string
  confidence?: number
  findings: AgentActionFinding[]
  stakeholders?: AgentActionStakeholder[]
  output: string
}

export interface AgentActionsProps {
  request: PartnershipRequest
  /** Play the step-by-step run. When false the finished checklist is shown. */
  animate?: boolean
  /** Fired once when the animated run has finished */
  onComplete?: () => void
  className?: string
}
