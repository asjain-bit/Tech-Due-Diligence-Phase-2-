import React from 'react'
import type { StageFooterProps } from './StageFooter.types'

/**
 * StageFooter — Molecule
 * The action bar fixed to the bottom of a workflow stage card: it spans the card, stays in view
 * while the content above scrolls, and holds the stage's acknowledgement and next step.
 * Used in: NdaDiscoveryStage, ValueDueDiligenceStage
 */
export const StageFooter: React.FC<StageFooterProps> = ({ children, className = '' }) => (
  <div
    className={`sticky bottom-0 z-30 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 mt-8 px-6 sm:px-8 py-3.5 bg-white border-t border-[#e2e8f0] shadow-[0_-4px_12px_rgba(15,23,42,0.06)] rounded-b-2xl flex items-center justify-between gap-4 flex-wrap ${className}`.trim()}
  >
    {children}
  </div>
)
