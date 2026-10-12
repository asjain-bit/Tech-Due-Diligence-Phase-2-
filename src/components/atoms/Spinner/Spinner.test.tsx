import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from '@/components/atoms/Spinner'

describe('Spinner', () => {
  it('renders with role="status" and default aria-label', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with custom label', () => {
    render(<Spinner label="Fetching records" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching records')
  })

  it('applies size classes', () => {
    const { rerender } = render(<Spinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('h-4 w-4')

    rerender(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-8 w-8')
  })
})
