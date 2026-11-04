import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('toggles through its label', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox checked={false} onChange={onChange} label="Mandatory" />)
    await user.click(screen.getByText('Mandatory'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows the primary fill and a tick when checked', () => {
    const { container } = render(<Checkbox checked onChange={vi.fn()} label="Mandatory" />)
    expect(screen.getByRole('checkbox', { name: 'Mandatory' })).toBeChecked()
    expect(container.querySelector('span.bg-\\[\\#36c0c9\\] svg')).not.toBeNull()
  })

  it('can be disabled', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} label="Mandatory" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
