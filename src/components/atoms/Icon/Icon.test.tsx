import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Icon } from '@/components/atoms/Icon'

describe('Icon', () => {
  it('renders with role="img" and accessible label', () => {
    render(<Icon name="search" label="Search icons" />)
    const icon = screen.getByRole('img', { name: 'Search icons' })
    expect(icon).toBeInTheDocument()
  })

  it('renders all supported Lucide icon types', () => {
    const icons = [
      'search',
      'sun',
      'moon',
      'laptop',
      'close',
      'chevron-left',
      'chevron-right',
      'chevron-up',
      'chevron-down',
      'check',
      'alert',
      'info',
      'settings',
    ] as const

    icons.forEach((name) => {
      const { unmount } = render(<Icon name={name} />)
      expect(screen.getByRole('img', { name })).toBeInTheDocument()
      unmount()
    })
  })

  it('applies standardized Lucide pixel sizing', () => {
    const { rerender } = render(<Icon name="search" size="sm" />)
    const smIcon = screen.getByRole('img')
    expect(smIcon).toHaveAttribute('width', '16')
    expect(smIcon).toHaveAttribute('height', '16')

    rerender(<Icon name="search" size="md" />)
    const mdIcon = screen.getByRole('img')
    expect(mdIcon).toHaveAttribute('width', '20')
    expect(mdIcon).toHaveAttribute('height', '20')

    rerender(<Icon name="search" size="lg" />)
    const lgIcon = screen.getByRole('img')
    expect(lgIcon).toHaveAttribute('width', '24')
    expect(lgIcon).toHaveAttribute('height', '24')
  })
})
