import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
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

  it('shows the title, supporting text and the five checks', () => {
    render(<ThinkingMode onComplete={vi.fn()} />)
    expect(screen.getByText('ANALYZING')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Initial Assessment Brief' })).toBeInTheDocument()
    expect(
      screen.getByText(
        /Our AI agent is analyzing the vendor submission and running multiple checks/
      )
    ).toBeInTheDocument()
    expect(THINKING_CHECKS).toEqual([
      'Reading vendor form details',
      'Checking for duplicate solutions',
      'Evaluating portfolio match',
      'Reviewing regulatory requirements',
      'Assessing market and competitive landscape',
    ])
    THINKING_CHECKS.forEach((label) => expect(screen.getByText(label)).toBeInTheDocument())
    expect(
      screen.getByRole('img', { name: /assessment brief being prepared/i })
    ).toBeInTheDocument()
  })

  it('starts with the first check active and the rest pending', () => {
    render(<ThinkingMode onComplete={vi.fn()} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((r) => r.dataset.state)).toEqual([
      'active',
      'pending',
      'pending',
      'pending',
      'pending',
    ])
    expect(within(rows[0]).getByText('Analyzing...')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('completes each check in turn and then calls onComplete once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ThinkingMode onComplete={onComplete} stepMs={1000} />)

    runTimers(1)
    let rows = screen.getAllByRole('listitem')
    expect(rows.map((r) => r.dataset.state)).toEqual([
      'done',
      'active',
      'pending',
      'pending',
      'pending',
    ])
    expect(within(rows[0]).getByText('Completed')).toBeInTheDocument()

    runTimers(3)
    rows = screen.getAllByRole('listitem')
    expect(rows.map((r) => r.dataset.state)).toEqual(['done', 'done', 'done', 'done', 'active'])
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(1)
    expect(screen.getAllByText('Completed')).toHaveLength(5)
    expect(screen.getByText('ANALYSIS COMPLETE')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(2)
    expect(onComplete).toHaveBeenCalledTimes(1)
    runTimers(3)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('keeps status text visible and skips decorative motion for reduced motion', () => {
    const original = window.matchMedia
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const { container } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(container.querySelector('animate, animateMotion')).toBeNull()
    expect(container.querySelector('.animate-pulse, .animate-spin')).toBeNull()
    window.matchMedia = original
  })

  it('shows only the document illustration and a spinner on the running step', () => {
    const { container } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(container.querySelector('animateMotion')).toBeNull()
    expect(container.querySelectorAll('li[data-state="active"] svg').length).toBe(1)
  })

  it('renders a compact variant with its own checks and title', () => {
    render(
      <ThinkingMode
        compact
        checks={['One', 'Two']}
        title="Finding"
        description="Desc"
        onComplete={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Finding' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('animates the vector when motion is allowed', () => {
    const { container } = render(<ThinkingMode onComplete={vi.fn()} />)
    expect(container.querySelectorAll('animate').length).toBeGreaterThan(0)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })
})
