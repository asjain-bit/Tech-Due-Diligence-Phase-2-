import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from '@/components/atoms/Avatar'

describe('Avatar', () => {
  it('renders image when valid src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Jane Doe" fallback="JD" />)
    const img = screen.getByRole('img', { name: 'Jane Doe' })
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })

  it('renders fallback text when no src is provided', () => {
    render(<Avatar fallback="Alice" alt="Alice User" />)
    const fallback = screen.getByRole('img', { name: 'Alice User' })
    expect(fallback).toBeInTheDocument()
    expect(fallback.textContent).toBe('AL')
  })

  it('falls back to text when image triggers onError', () => {
    render(<Avatar src="https://example.com/broken.jpg" alt="Bob" fallback="Bob" />)
    const img = screen.getByRole('img', { name: 'Bob' })
    fireEvent.error(img)
    const fallback = screen.getByRole('img', { name: 'Bob' })
    expect(fallback.textContent).toBe('BO')
  })

  it('applies size classes', () => {
    const { rerender } = render(<Avatar fallback="SM" size="sm" />)
    expect(screen.getByRole('img')).toHaveClass('h-8 w-8')

    rerender(<Avatar fallback="LG" size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('h-12 w-12')
  })
})
