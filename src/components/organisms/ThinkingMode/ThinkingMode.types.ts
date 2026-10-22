export interface ThinkingModeProps {
  /** Fired once, shortly after the last check has completed */
  onComplete: () => void
  /**
   * Prototype pacing in milliseconds per check. The progress is a mock until the agent API
   * reports real status, at which point `step` can be driven from that instead.
   */
  stepMs?: number
  className?: string
}
