import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DataTable } from './DataTable'

describe('DataTable Organism', () => {
  const sampleColumns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
  ]
  const sampleData = [
    { name: 'Alice', role: 'Engineer' },
    { name: 'Bob', role: 'Designer' },
    { name: 'Charlie', role: 'Product Manager' },
  ]

  it('renders data table rows', () => {
    render(<DataTable columns={sampleColumns} data={sampleData} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
  })

  it('filters data when search input is used', async () => {
    render(<DataTable columns={sampleColumns} data={sampleData} />)
    const filterInput = screen.getByPlaceholderText('Filter table...')
    await userEvent.type(filterInput, 'Alice')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })
})
