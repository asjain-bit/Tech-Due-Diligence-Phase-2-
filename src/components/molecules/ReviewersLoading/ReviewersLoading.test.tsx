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

  it('finds the teams, maps them, then completes once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ReviewersLoading internalCount={5} strategyCount={1} onComplete={onComplete} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Finding reviewers')).toBeInTheDocument()
    expect(screen.getByText('Finding the Internal Interest team…')).toBeInTheDocument()

    runTimers(1)
    expect(screen.getByText('5 reviewers found')).toBeInTheDocument()
    expect(screen.getByText('Finding the Strategy team…')).toBeInTheDocument()

    runTimers(1)
    expect(screen.getByText('1 reviewer found')).toBeInTheDocument()
    expect(screen.getByText('Mapping reviewers to this request…')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    runTimers(3)
    expect(screen.getByText('Matched on KPI and expertise')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
