'use client'

/**
 * ReviewersLoading — Molecule
 * Compact version of the agent thinking animation, shown while the agent finds and maps the
 * Internal Interest or Strategy reviewers, before the stage appears.
 * Used in: PartnershipDetail
 */

import React from 'react'
import { ThinkingMode } from '@/components/organisms/ThinkingMode'
import type { ReviewersLoadingProps } from './ReviewersLoading.types'

export const ReviewersLoading: React.FC<ReviewersLoadingProps> = ({
  team,
  count,
  onComplete,
  className = '',
}) => {
  const isInternal = team === 'internal'
  return (
    <ThinkingMode
      compact
      eyebrow="MATCHING REVIEWERS"
      stepMs={1000}
      onComplete={onComplete}
      className={className}
      title={isInternal ? 'Finding the Internal Interest team' : 'Finding the Strategy team'}
      description={`The agent is choosing who should review this request. ${count} ${
        count === 1 ? 'reviewer' : 'reviewers'
      } matched so far.`}
      checks={
        isInternal
          ? ['Finding the Internal Interest team', 'Mapping reviewers to KPIs and expertise']
          : ['Finding the Strategy team', 'Mapping the reviewer to this request']
      }
    />
  )
}
