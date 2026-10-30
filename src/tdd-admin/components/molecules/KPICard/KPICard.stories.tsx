import type { Meta, StoryObj } from '@storybook/react'
import { KPICard } from './KPICard'

const meta: Meta<typeof KPICard> = {
  title: 'TDD Admin/Molecules/KPICard',
  component: KPICard,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof KPICard>

export const Default: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$124,500',
    change: '+14.2%',
    trend: 'up',
    badgeText: 'Q3 Goal',
    badgeVariant: 'success',
  },
}

export const GridDisplay: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KPICard title="Active Sessions" value="3,420" change="+8.1%" trend="up" badgeText="Live" badgeVariant="info" />
      <KPICard title="Bounce Rate" value="24.8%" change="-2.3%" trend="down" badgeText="Healthy" badgeVariant="success" />
      <KPICard title="Error Rate" value="1.82%" change="+0.4%" trend="down" badgeText="Warning" badgeVariant="warning" />
    </div>
  ),
}

export const EdgeCases: Story = {
  render: () => (
    <KPICard
      title="Extremely long title label text overflow test"
      value="999,999,999.00"
      badgeText="Long Tag"
    />
  ),
}
