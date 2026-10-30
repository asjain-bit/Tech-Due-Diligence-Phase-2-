import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'
import { Badge } from '@/tdd-admin/components/atoms/Badge'
import { Column } from './DataTable.types'

const meta: Meta<typeof DataTable> = {
  title: 'TDD Admin/Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof DataTable>

const columns: Column<Record<string, unknown>>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Component' },
  { key: 'layer', header: 'Layer', render: (row: Record<string, unknown>) => <Badge variant="info">{String(row.layer)}</Badge> },
  { key: 'status', header: 'Status', render: (row: Record<string, unknown>) => <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{String(row.status)}</Badge> },
]

const data: Record<string, unknown>[] = [
  { id: 'CMP-101', name: 'Button', layer: 'Atom', status: 'Ready' },
  { id: 'CMP-102', name: 'FormField', layer: 'Molecule', status: 'Ready' },
  { id: 'CMP-103', name: 'SiteHeader', layer: 'Organism', status: 'In Review' },
  { id: 'CMP-104', name: 'AppShell', layer: 'Template', status: 'Ready' },
]

export const Default: Story = {
  args: {
    title: 'Component Library Catalog',
    columns,
    data,
  },
}

export const Empty: Story = {
  args: {
    title: 'Empty Dataset',
    columns,
    data: [],
  },
}

export const EdgeCases: Story = {
  args: {
    title: 'Paginated Data',
    columns,
    data,
    pageSize: 2,
  },
}
