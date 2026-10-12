import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/atoms/Input'

describe('Input', () => {
  it('renders with placeholder and value', () => {
    render(<Input placeholder="Enter username" defaultValue="testuser" />)
    const input = screen.getByPlaceholderText('Enter username')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('testuser')
  })

  it('handles user input onChange', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Input placeholder="Search" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Search')
    await user.type(input, 'hello')
    expect(handleChange).toHaveBeenCalledTimes(5)
    expect(input).toHaveValue('hello')
  })

  it('applies error styling and aria-invalid when hasError is true', () => {
    render(<Input placeholder="Error field" hasError />)
    const input = screen.getByPlaceholderText('Error field')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('border-status-error-border')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Input placeholder="Size test" inputSize="sm" />)
    expect(screen.getByPlaceholderText('Size test')).toHaveClass('text-xs')

    rerender(<Input placeholder="Size test" inputSize="lg" />)
    expect(screen.getByPlaceholderText('Size test')).toHaveClass('text-base')
  })

  it('respects disabled attribute', () => {
    render(<Input placeholder="Disabled input" disabled />)
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
  })
})
