import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

describe('Input Atom', () => {
  it('renders input element correctly', () => {
    render(<Input placeholder="Enter name..." />)
    expect(screen.getByPlaceholderText('Enter name...')).toBeInTheDocument()
  })

  it('handles user typing', async () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Hello')
    expect(input).toHaveValue('Hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders error state border', () => {
    render(<Input error placeholder="Error state" />)
    expect(screen.getByPlaceholderText('Error state')).toHaveClass('border-[#d92d20]')
  })
})
