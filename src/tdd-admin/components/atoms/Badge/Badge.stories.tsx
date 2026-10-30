import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'TDD Admin/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'neutral',
  },
}

export const StatusVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const EdgeCases: Story = {
  render: () => (
    <Badge className="max-w-[100px] truncate">
      Very long badge text content overflow test
    </Badge>
  ),
}
