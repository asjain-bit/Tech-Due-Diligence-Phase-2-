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

  it('renders all supported icon types', () => {
    const icons = [
      'search',
      'sun',
      'moon',
      'laptop',
      'close',
      'chevron-left',
      'chevron-right',
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

  it('applies size classes', () => {
    const { rerender } = render(<Icon name="search" size="sm" />)
    expect(screen.getByRole('img')).toHaveClass('h-4 w-4')

    rerender(<Icon name="search" size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('h-6 w-6')
  })
})
