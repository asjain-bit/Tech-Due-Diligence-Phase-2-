import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchBar } from '@/components/molecules/SearchBar'

describe('SearchBar', () => {
  it('renders input with placeholder and button', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Find items..." />)
    expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar value="" onChange={handleChange} />)
    const input = screen.getByRole('searchbox')
    await user.type(input, 'query')
    expect(handleChange).toHaveBeenCalled()
  })

  it('triggers onSearch on button click and on Enter key', async () => {
    const handleSearch = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar value="audit" onChange={vi.fn()} onSearch={handleSearch} />)
    const button = screen.getByRole('button', { name: 'Search' })
    await user.click(button)
    expect(handleSearch).toHaveBeenCalledWith('audit')

    const input = screen.getByRole('searchbox')
    await user.type(input, '{enter}')
    expect(handleSearch).toHaveBeenCalledTimes(2)
  })

  it('clears query when clear button is clicked', async () => {
    const handleChange = vi.fn()
    const handleClear = vi.fn()
    const user = userEvent.setup()

    render(<SearchBar value="current text" onChange={handleChange} onClear={handleClear} />)

    const clearButton = screen.getByRole('button', { name: 'Clear search query' })
    await user.click(clearButton)
    expect(handleChange).toHaveBeenCalledWith('')
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('respects disabled state', () => {
    render(<SearchBar value="" onChange={vi.fn()} disabled />)
    expect(screen.getByRole('searchbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  })
})
