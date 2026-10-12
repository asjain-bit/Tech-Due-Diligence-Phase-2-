import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusChip } from './StatusChip'
import type { StatusCategory } from './StatusChip.types'

describe('StatusChip', () => {
  it('renders label correctly', () => {
    render(<StatusChip label="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders with status dot when dot is true', () => {
    const { container } = render(<StatusChip label="Ready" status="success" dot />)
    const dotSpan = container.querySelector('.rounded-full.shrink-0')
    expect(dotSpan).toBeInTheDocument()
  })

  it('handles all status variants', () => {
    const statuses: StatusCategory[] = [
      'success',
      'warning',
      'error',
      'info',
      'neutral',
      'finalised',
    ]
    statuses.forEach((st) => {
      const { unmount } = render(<StatusChip label={st} status={st} dot />)
      expect(screen.getByText(st)).toBeInTheDocument()
      unmount()
    })
  })
})
