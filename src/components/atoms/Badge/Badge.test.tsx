import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/atoms/Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-status-success-bg')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-status-warning-bg')

    rerender(<Badge variant="error">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-status-error-bg')

    rerender(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('bg-status-info-bg')

    rerender(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-bg-surface-2')
  })

  it('applies size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('px-2 py-0.5')

    rerender(<Badge size="md">Medium</Badge>)
    expect(screen.getByText('Medium')).toHaveClass('px-2.5 py-1')
  })
})
