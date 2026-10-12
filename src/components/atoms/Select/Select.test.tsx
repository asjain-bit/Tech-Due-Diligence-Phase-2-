import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Select } from '@/components/atoms/Select'

describe('Select', () => {
  const sampleOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', disabled: true },
  ]

  it('renders with options array', () => {
    render(<Select aria-label="Fruit" options={sampleOptions} defaultValue="apple" />)
    const select = screen.getByRole('combobox', { name: 'Fruit' })
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })

  it('renders with children option tags', () => {
    render(
      <Select aria-label="Color" defaultValue="red">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>
    )
    expect(screen.getByRole('option', { name: 'Red' })).toBeInTheDocument()
  })

  it('handles onChange selection events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<Select aria-label="Fruit" options={sampleOptions} onChange={handleChange} />)
    const select = screen.getByRole('combobox', { name: 'Fruit' })
    await user.selectOptions(select, 'banana')
    expect(handleChange).toHaveBeenCalled()
    expect(select).toHaveValue('banana')
  })

  it('applies error styling and aria-invalid', () => {
    render(<Select aria-label="Error" options={sampleOptions} hasError />)
    const select = screen.getByRole('combobox', { name: 'Error' })
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveClass('border-status-error-border')
  })

  it('applies size classes', () => {
    const { rerender } = render(
      <Select aria-label="Size" options={sampleOptions} selectSize="sm" />
    )
    expect(screen.getByRole('combobox', { name: 'Size' })).toHaveClass('text-xs')

    rerender(<Select aria-label="Size" options={sampleOptions} selectSize="lg" />)
    expect(screen.getByRole('combobox', { name: 'Size' })).toHaveClass('text-base')
  })

  it('respects disabled state', () => {
    render(<Select aria-label="Disabled" options={sampleOptions} disabled />)
    expect(screen.getByRole('combobox', { name: 'Disabled' })).toBeDisabled()
  })
})
