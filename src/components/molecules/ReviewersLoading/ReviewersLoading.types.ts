export interface ReviewersLoadingProps {
  team: 'internal' | 'strategy'
  count: number
  /** Fired once after the last line has finished */
  onComplete: () => void
  className?: string
}
