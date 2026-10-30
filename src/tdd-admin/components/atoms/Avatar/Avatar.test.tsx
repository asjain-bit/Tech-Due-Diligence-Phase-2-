import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar Atom', () => {
  it('renders fallback text when no src is provided', () => {
    render(<Avatar fallback="JD" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders image when src is valid', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />)
    expect(screen.getByAltText('User avatar')).toBeInTheDocument()
  })

  it('falls back to initials on image error', () => {
    render(<Avatar src="https://example.com/broken.jpg" fallback="AB" alt="Broken" />)
    const img = screen.getByAltText('Broken')
    fireEvent.error(img)
    expect(screen.getByText('AB')).toBeInTheDocument()
  })
})
