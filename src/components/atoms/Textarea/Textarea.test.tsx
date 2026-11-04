import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Textarea } from '@/components/atoms/Textarea'

describe('Textarea', () => {
  it('renders with placeholder and value', () => {
    render(<Textarea placeholder="Enter biography" defaultValue="Hello world" />)
    const textarea = screen.getByPlaceholderText('Enter biography')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('Hello world')
  })

  it('handles typing and onChange events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Textarea placeholder="Type bio" onChange={handleChange} />)
    const textarea = screen.getByPlaceholderText('Type bio')
    await user.type(textarea, 'abc')
    expect(handleChange).toHaveBeenCalledTimes(3)
  })

  it('applies error styling and aria-invalid when hasError is true', () => {
    render(<Textarea placeholder="Error textarea" hasError />)
    const textarea = screen.getByPlaceholderText('Error textarea')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('border-status-error-border')
  })

  it('applies resize styles', () => {
    const { rerender } = render(<Textarea placeholder="Resize" resize="none" />)
    expect(screen.getByPlaceholderText('Resize')).toHaveClass('resize-none')

    rerender(<Textarea placeholder="Resize" resize="both" />)
    expect(screen.getByPlaceholderText('Resize')).toHaveClass('resize')
  })

  it('respects disabled state', () => {
    render(<Textarea placeholder="Disabled" disabled />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })
})
