import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Radio } from './Radio'

describe('Radio', () => {
  it('selects through its label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Radio name="g" checked={false} onChange={onChange} label="Proceed" />)
    await user.click(screen.getByText('Proceed'))
    expect(onChange).toHaveBeenCalled()
  })

  it('shows a primary fill with a white dot when selected', () => {
    const { container } = render(<Radio name="g" checked onChange={vi.fn()} label="Proceed" />)
    expect(screen.getByRole('radio', { name: 'Proceed' })).toBeChecked()
    expect(container.querySelector('span.bg-\\[\\#36c0c9\\] span.bg-white')).not.toBeNull()
  })
})
