import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DataTable } from '@/components/organisms/DataTable'
import { Badge } from '@/components/atoms/Badge'
import type { Column } from '@/components/organisms/DataTable'

interface UserItem extends Record<string, unknown> {
  id: string
  name: string
  role: string
  score: number
  status: 'active' | 'inactive'
}

describe('DataTable', () => {
  const sampleColumns: Column<UserItem>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'score', header: 'Score', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'default'} size="sm">
          {row.status}
        </Badge>
      ),
    },
  ]

  const sampleData: UserItem[] = [
    { id: '1', name: 'Alice Smith', role: 'Engineer', score: 95, status: 'active' },
    { id: '2', name: 'Bob Jones', role: 'Designer', score: 80, status: 'inactive' },
    { id: '3', name: 'Charlie Brown', role: 'Architect', score: 88, status: 'active' },
    { id: '4', name: 'Diana Prince', role: 'Manager', score: 92, status: 'active' },
    { id: '5', name: 'Evan Wright', role: 'Support', score: 75, status: 'inactive' },
    { id: '6', name: 'Fiona Gallagher', role: 'Analyst', score: 85, status: 'active' },
  ]

  it('renders columns and paginated rows', () => {
    render(<DataTable columns={sampleColumns} data={sampleData} pageSize={5} />)

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.queryByText('Fiona Gallagher')).not.toBeInTheDocument()
  })

  it('navigates pagination pages', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={sampleColumns} data={sampleData} pageSize={5} />)

    const nextBtn = screen.getByRole('button', { name: 'Next page' })
    await user.click(nextBtn)

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Fiona Gallagher')).toBeInTheDocument()
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()

    const prevBtn = screen.getByRole('button', { name: 'Previous page' })
    await user.click(prevBtn)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('filters rows based on search input', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={sampleColumns} data={sampleData} />)

    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'Designer')

    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
  })

  it('sorts records for strings and numbers across 3-click cycle', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={sampleColumns} data={sampleData} pageSize={10} />)

    const nameHeader = screen.getByRole('columnheader', { name: /name/i })
    await user.click(nameHeader) // asc
    expect(screen.getByRole('img', { name: 'chevron-up' })).toBeInTheDocument()

    await user.click(nameHeader) // desc
    expect(screen.getByRole('img', { name: 'chevron-down' })).toBeInTheDocument()

    await user.click(nameHeader) // reset to null
    expect(screen.queryByRole('img', { name: 'chevron-down' })).not.toBeInTheDocument()

    // Sort numbers
    const scoreHeader = screen.getByRole('columnheader', { name: /score/i })
    await user.click(scoreHeader) // score asc
    expect(screen.getByRole('img', { name: 'chevron-up' })).toBeInTheDocument()
    await user.click(scoreHeader) // score desc
    expect(screen.getByRole('img', { name: 'chevron-down' })).toBeInTheDocument()
  })

  it('updates page size when select changes', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={sampleColumns} data={sampleData} pageSize={5} />)

    const select = screen.getByRole('combobox', { name: 'Rows per page' })
    await user.selectOptions(select, '10')

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByText('Fiona Gallagher')).toBeInTheDocument()
  })

  it('displays empty message when no records match filter', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={sampleColumns} data={sampleData} />)

    const searchInput = screen.getByPlaceholderText('Filter records...')
    await user.type(searchInput, 'nonexistentquery')

    expect(screen.getByText('No matching records found.')).toBeInTheDocument()
  })
})
