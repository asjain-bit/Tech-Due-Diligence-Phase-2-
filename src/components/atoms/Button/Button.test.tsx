import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/atoms/Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Submit</Button>)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-action-destructive-bg-default')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-border-default')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-transparent')

    rerender(<Button variant="soft">Soft</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-action-primary-bg-soft')
  })

  it('applies size and fullWidth classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-xs')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-base')

    rerender(<Button fullWidth>Full</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})
