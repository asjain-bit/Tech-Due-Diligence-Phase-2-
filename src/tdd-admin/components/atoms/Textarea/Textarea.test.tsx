import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea Atom', () => {
  it('renders textarea element correctly', () => {
    render(<Textarea placeholder="Type description..." />)
    expect(screen.getByPlaceholderText('Type description...')).toBeInTheDocument()
  })

  it('allows text entry', async () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'Multiline text\nSecond line')
    expect(textarea).toHaveValue('Multiline text\nSecond line')
  })
})
