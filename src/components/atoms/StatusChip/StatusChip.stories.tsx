import type { Meta, StoryObj } from '@storybook/react'
import { StatusChip } from './StatusChip'

const meta: Meta<typeof StatusChip> = {
  title: 'Atoms/StatusChip',
  component: StatusChip,
  args: {
    label: 'Completed',
    status: 'success',
    dot: true,
  },
}

export default meta
type Story = StoryObj<typeof StatusChip>

export const Default: Story = {}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusChip label="Success" status="success" dot />
      <StatusChip label="Warning" status="warning" dot />
      <StatusChip label="Error" status="error" dot />
      <StatusChip label="Info" status="info" dot />
      <StatusChip label="Finalised" status="finalised" dot />
      <StatusChip label="Neutral" status="neutral" />
    </div>
  ),
}

export const EdgeCases: Story = {
  args: {
    label: 'Very Long Status Label for Extreme Width Testing',
    status: 'warning',
    dot: true,
  },
}
