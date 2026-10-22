export interface ReviewersLoadingProps {
  internalCount: number
  strategyCount: number
  /** Fired once after the last line has finished */
  onComplete: () => void
  className?: string
}
