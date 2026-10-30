import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge Atom', () => {
  it('renders badge text', () => {
    render(<Badge variant="success">Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    render(<Badge variant="error">Failed</Badge>)
    expect(screen.getByText('Failed')).toHaveClass('bg-status-error-bg')
  })
})
