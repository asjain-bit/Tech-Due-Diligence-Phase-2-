import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormField } from './FormField'

describe('FormField Molecule', () => {
  it('renders label and input', () => {
    render(<FormField label="Email Address" placeholder="you@example.com" />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('renders helper text when provided', () => {
    render(<FormField label="Username" helperText="Must be at least 3 characters" />)
    expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<FormField label="Password" errorMessage="Password is required" />)
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })
})
