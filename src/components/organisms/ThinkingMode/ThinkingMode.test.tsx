import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { THINKING_CHECKS, ThinkingMode } from './ThinkingMode'

describe('ThinkingMode', () => {
  afterEach(() => vi.useRealTimers())

  const runTimers = (steps: number, ms = 1000) => {
    for (let i = 0; i < steps; i++) {
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    }
  }

  it('is simple: an illustration, a short description and one line of progress', () => {
    const { container } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(screen.getByText('ANALYZING')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Our AI agent is analyzing the vendor submission and running multiple checks/
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /assessment brief being prepared/i })
    ).toBeInTheDocument()
    // No checklist, no per-step status
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(`${THINKING_CHECKS[0]}…`)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('moves the progress text on, then calls onComplete once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ThinkingMode onComplete={onComplete} stepMs={1000} />)
    expect(screen.getByText(`${THINKING_CHECKS[0]}…`)).toBeInTheDocument()
    runTimers(1)
    expect(screen.getByText(`${THINKING_CHECKS[1]}…`)).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    runTimers(6)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('takes its own messages, eyebrow and description', () => {
    render(
      <ThinkingMode
        inline
        eyebrow="GENERATING"
        description="Preparing the report."
        messages={['Reading documents', 'Writing']}
        onComplete={vi.fn()}
      />
    )
    expect(screen.getByText('GENERATING')).toBeInTheDocument()
    expect(screen.getByText('Preparing the report.')).toBeInTheDocument()
    expect(screen.getByText('Reading documents…')).toBeInTheDocument()
    expect(screen.getByRole('status').className).not.toContain('min-h-[calc')
  })

  it('shows a title only when one is given', () => {
    const { rerender } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    rerender(<ThinkingMode title="Finding" onComplete={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Finding' })).toBeInTheDocument()
  })

  it('keeps the text and skips the spinning and pulsing for reduced motion', () => {
    const original = window.matchMedia
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const { container } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(screen.getByText(`${THINKING_CHECKS[0]}…`)).toBeInTheDocument()
    expect(container.querySelector('animate, animateMotion')).toBeNull()
    expect(container.querySelector('.animate-spin, .animate-pulse')).toBeNull()
    window.matchMedia = original
  })
})
