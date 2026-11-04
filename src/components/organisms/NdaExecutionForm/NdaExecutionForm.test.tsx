import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NdaExecutionForm } from './NdaExecutionForm'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('NdaExecutionForm', () => {
  it('shows the form parts A to D, read-only, with the case details filled in', () => {
    render(<NdaExecutionForm request={INITIAL_PARTNERSHIP_REQUESTS[1]} />)
    expect(screen.getByRole('heading', { name: 'NDA Execution Form' })).toBeInTheDocument()
    ;[
      'Part A: NDA Summary (for completion by Business Owner)',
      'Part B: Governance & Compliance (for completion by Compliance)',
      'Part C: Legal (for completion by Legal)',
      'Part D: Other Approvers (where applicable)',
    ].forEach((t) => expect(screen.getByRole('heading', { name: t })).toBeInTheDocument())
    expect(screen.getAllByText('AlphaHealth BioTech').length).toBeGreaterThan(0)
    expect(screen.getByText('CardioScan AI Diagnostic Platform')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('marks the standard template as selected', () => {
    render(<NdaExecutionForm request={INITIAL_PARTNERSHIP_REQUESTS[1]} />)
    expect(screen.getByText('Standard ADHDS Template').parentElement).toHaveTextContent(
      '(selected)'
    )
    expect(screen.getByText('Non-standard Template').parentElement).toHaveTextContent(
      '(not selected)'
    )
  })
})
