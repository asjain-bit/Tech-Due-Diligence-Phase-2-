import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormField } from '@/components/molecules/FormField'
import { Input } from '@/components/atoms/Input'

describe('FormField', () => {
  it('renders label with htmlFor matching input id', () => {
    render(<FormField id="email" label="Email Address" />)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
  })

  it('indicates required status', () => {
    render(<FormField id="name" label="Full Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders helper text when no error exists', () => {
    render(<FormField id="username" label="Username" helperText="Must be at least 3 characters." />)
    expect(screen.getByText('Must be at least 3 characters.')).toBeInTheDocument()
  })

  it('renders error message and suppresses helper text', () => {
    render(
      <FormField
        id="password"
        label="Password"
        helperText="Password must be strong"
        error="Password is too weak"
      />
    )
    expect(screen.getByText('Password is too weak')).toBeInTheDocument()
    expect(screen.queryByText('Password must be strong')).not.toBeInTheDocument()
  })

  it('renders custom children instead of default input', () => {
    render(
      <FormField id="custom" label="Custom Field">
        <Input id="custom" placeholder="Custom child input" />
      </FormField>
    )
    expect(screen.getByPlaceholderText('Custom child input')).toBeInTheDocument()
  })
})
