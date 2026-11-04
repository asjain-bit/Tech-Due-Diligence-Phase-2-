import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar Molecule', () => {
  it('renders search input field', () => {
    render(<SearchBar placeholder="Find components..." />)
    expect(screen.getByPlaceholderText('Find components...')).toBeInTheDocument()
  })

  it('triggers onSearch when Enter key is pressed', async () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)
    const input = screen.getByPlaceholderText('Search...')
    await userEvent.type(input, 'React 19{enter}')
    expect(handleSearch).toHaveBeenCalledWith('React 19')
  })

  it('clears query when clear icon is clicked', async () => {
    const handleChange = vi.fn()
    render(<SearchBar value="Test query" onChange={handleChange} />)
    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await userEvent.click(clearButton)
    expect(handleChange).toHaveBeenCalledWith('')
  })
})
