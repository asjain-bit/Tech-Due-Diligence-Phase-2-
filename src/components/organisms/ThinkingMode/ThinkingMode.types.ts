export interface ThinkingModeProps {
  /** Fired once, shortly after the last check has completed */
  onComplete: () => void
  /**
   * Prototype pacing in milliseconds per check. The progress is a mock until the agent API
   * reports real status, at which point `step` can be driven from that instead.
   */
  stepMs?: number
  className?: string
  /** Checks to run, in order. Defaults to the five Initial Assessment Brief checks */
  checks?: string[]
  title?: string
  /** Small label above the title while running */
  eyebrow?: string
  description?: string
  /** Smaller layout for use inside a page section instead of the full pane */
  compact?: boolean
}
