import type { PartnershipRequest } from '@/types/partnership.types'

export type AgentActionStatus = 'passed' | 'attention' | 'complete'

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
  title: string
  /** What the agent was asked to check */
  check: string
  status: AgentActionStatus
  /** One-line result shown while collapsed */
  headline: string
  confidence?: number
  findings: AgentActionFinding[]
  stakeholders?: AgentActionStakeholder[]
  output: string
}

export interface AgentActionsProps {
  request: PartnershipRequest
  className?: string
}
