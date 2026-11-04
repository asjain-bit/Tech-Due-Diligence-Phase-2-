export interface FilterOption {
  value: string
  label: string
}

export interface TableFilterMenuProps {
  stage: string
  stageOptions: FilterOption[]
  /** Omit for tables that have no SLA status */
  sla?: string
  slaOptions?: FilterOption[]
  sort: string
  sortOptions: FilterOption[]
  onStageChange: (value: string) => void
  onSlaChange?: (value: string) => void
  onSortChange: (value: string) => void
  /** Number of filters that differ from "All" */
  activeCount: number
  onClear: () => void
}
