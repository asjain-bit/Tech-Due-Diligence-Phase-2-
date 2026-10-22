import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { ReviewersLoading } from './ReviewersLoading'

describe('ReviewersLoading', () => {
  afterEach(() => vi.useRealTimers())

  const runTimers = (seconds: number) => {
    for (let i = 0; i < seconds; i++) {
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }
  }

  it('finds the Internal Interest team, maps it, then completes once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ReviewersLoading team="internal" count={5} onComplete={onComplete} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Finding the Internal Interest team' })
    ).toBeInTheDocument()
    expect(screen.getByText(/5 reviewers matched/)).toBeInTheDocument()
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()

    runTimers(1)
    expect(screen.getAllByText('Completed')).toHaveLength(1)
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(3)
    expect(screen.getAllByText('Completed')).toHaveLength(2)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('finds the Strategy team', () => {
    vi.useFakeTimers()
    render(<ReviewersLoading team="strategy" count={1} onComplete={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Finding the Strategy team' })).toBeInTheDocument()
    expect(screen.getByText(/1 reviewer matched/)).toBeInTheDocument()
  })
})
