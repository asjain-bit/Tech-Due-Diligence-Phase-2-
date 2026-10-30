import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/tdd-admin/contexts/ThemeContext'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle Atom', () => {
  it('cycles themes when clicked', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle showLabel />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('light')

    await userEvent.click(button)
    expect(button).toHaveTextContent('dark')

    await userEvent.click(button)
    expect(button).toHaveTextContent('system')

    await userEvent.click(button)
    expect(button).toHaveTextContent('light')
  })
})
