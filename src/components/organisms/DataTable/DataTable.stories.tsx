import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from '@/components/organisms/DataTable'
import { Badge } from '@/components/atoms/Badge'
import type { Column } from '@/components/organisms/DataTable'

interface ClusterRecord extends Record<string, unknown> {
  id: string
  name: string
  region: string
  nodes: number
  status: 'healthy' | 'degraded' | 'provisioning'
}

const clusterColumns: Column<ClusterRecord>[] = [
  { key: 'name', header: 'Cluster Name', sortable: true },
  { key: 'region', header: 'Cloud Region', sortable: true },
  { key: 'nodes', header: 'Active Nodes', sortable: true },
  {
    key: 'status',
    header: 'Health State',
    render: (row) => {
      const variant =
        row.status === 'healthy' ? 'success' : row.status === 'degraded' ? 'error' : 'warning'
      return (
        <Badge variant={variant} size="sm">
          {row.status}
        </Badge>
      )
    },
  },
]

const clusterData: ClusterRecord[] = [
  { id: 'c-1', name: 'prod-us-east-1', region: 'us-east-1', nodes: 32, status: 'healthy' },
  { id: 'c-2', name: 'prod-eu-west-1', region: 'eu-west-1', nodes: 24, status: 'healthy' },
  { id: 'c-3', name: 'stage-ap-south-1', region: 'ap-south-1', nodes: 8, status: 'degraded' },
  { id: 'c-4', name: 'dev-us-west-2', region: 'us-west-2', nodes: 4, status: 'healthy' },
  { id: 'c-5', name: 'canary-us-east-2', region: 'us-east-2', nodes: 2, status: 'provisioning' },
  { id: 'c-6', name: 'backup-sa-east-1', region: 'sa-east-1', nodes: 6, status: 'healthy' },
]

const ClusterTable: React.FC<
  import('@/components/organisms/DataTable').DataTableProps<ClusterRecord>
> = (props) => <DataTable<ClusterRecord> {...props} />

const meta: Meta<typeof ClusterTable> = {
  title: 'Organisms/DataTable',
  component: ClusterTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ClusterTable>

export const Default: Story = {
  args: {
    columns: clusterColumns,
    data: clusterData,
    pageSize: 5,
  },
}

export const Empty: Story = {
  args: {
    columns: clusterColumns,
    data: [],
  },
}

export const EdgeCases: Story = {
  render: () => {
    const hugeData: ClusterRecord[] = Array.from({ length: 40 }, (_, idx) => ({
      id: `c-${idx + 10}`,
      name: `edge-cluster-partition-node-${idx + 1}-high-availability-mesh-deployment`,
      region: idx % 2 === 0 ? 'us-east-1' : 'eu-central-1',
      nodes: (idx + 1) * 3,
      status: idx % 3 === 0 ? 'degraded' : 'healthy',
    }))

    return (
      <div className="flex flex-col gap-6">
        <DataTable columns={clusterColumns} data={hugeData} pageSize={5} />
      </div>
    )
  },
}
