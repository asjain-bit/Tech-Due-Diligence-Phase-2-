import type { InternalScenario } from '@/types/partnership.types'

export interface PrototypeScenarioSelectProps {
  value?: InternalScenario
  onChange: (scenario: InternalScenario) => void
  disabled?: boolean
  className?: string
}
