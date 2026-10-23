export interface ThinkingModeProps {
  /** Fired once, shortly after the last check has completed */
  onComplete: () => void
  /**
   * Prototype pacing in milliseconds per check. The progress is a mock until the agent API
   * reports real status, at which point `step` can be driven from that instead.
   */
  stepMs?: number
  className?: string
  /** Progress text, shown one at a time. Defaults to the Initial Assessment Brief checks */
  messages?: string[]
  title?: string
  /** Small label above the title while running */
  eyebrow?: string
  description?: string
  /** Sits inside a page section instead of taking the whole page */
  inline?: boolean
}
