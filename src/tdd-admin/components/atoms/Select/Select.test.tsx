import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

describe('Select Atom', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ]

  it('renders select with options', () => {
    render(<Select options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
  })

  it('selects option on change', async () => {
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b')
    expect(handleChange).toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveValue('b')
  })
})
