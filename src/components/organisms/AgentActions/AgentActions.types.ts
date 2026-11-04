import type { PartnershipRequest } from '@/types/partnership.types'

export type AgentActionStatus = 'passed' | 'attention' | 'complete'

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export type AgentActionIcon =
  | 'history'
  | 'backlog'
  | 'uae'
  | 'screening'
  | 'duplicate'
  | 'classification'
  | 'maturity'
  | 'kpi'
  | 'commodity'
  | 'brief'

export interface AgentActionFinding {
  label: string
  value: string
}

export interface AgentActionStakeholder {
  name: string
  role: string
  reason: string
  confidence: ConfidenceLevel
}

export interface AgentAction {
  id: string
  icon: AgentActionIcon
  title: string
  /** What the agent was asked to check */
  check: string
  status: AgentActionStatus
  /** One-line result shown once the check is done */
  headline: string
  confidence?: ConfidenceLevel
  findings: AgentActionFinding[]
  stakeholders?: AgentActionStakeholder[]
  output: string
}

export interface AgentActionsProps {
  request: PartnershipRequest
  /** Checks to show. Defaults to the Director's checks for the request. */
  actions?: AgentAction[]
  className?: string
}
