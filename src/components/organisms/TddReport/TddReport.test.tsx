import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TddReport } from './TddReport'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('TddReport', () => {
  it('shows six sections with a verdict each', () => {
    render(<TddReport request={INITIAL_PARTNERSHIP_REQUESTS[2]} />)
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(6)
    expect(screen.getAllByText('Satisfactory').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Needs attention')).toHaveLength(2)
    expect(screen.getByText('Security and compliance')).toBeInTheDocument()
  })
})
