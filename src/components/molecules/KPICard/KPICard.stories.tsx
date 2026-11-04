import type { Meta, StoryObj } from '@storybook/react'
import { KPICard } from '@/components/molecules/KPICard'

const meta: Meta<typeof KPICard> = {
  title: 'Molecules/KPICard',
  component: KPICard,
  tags: ['autodocs'],
  argTypes: {
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
    },
    value: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof KPICard>

export const Default: Story = {
  args: {
    title: 'Active Subscribers',
    value: '24,580',
    change: '+8.4%',
    trend: 'up',
    badgeText: 'Monthly',
  },
}

export const TrendingUp: Story = {
  args: {
    title: 'Gross Volume',
    value: '$1,294,000',
    change: '+19.3%',
    trend: 'up',
    badgeText: 'YTD Target',
    description: 'Surpassing previous fiscal benchmark by $120k.',
  },
}

export const TrendingDown: Story = {
  args: {
    title: 'Error Rate',
    value: '1.42%',
    change: '-0.38%',
    trend: 'down',
    badgeText: 'SLA Guard',
    description: 'Calculated over trailing 7 days production traffic.',
  },
}

export const Neutral: Story = {
  args: {
    title: 'Database Connections',
    value: '128 / 500',
    change: 'Flat',
    trend: 'neutral',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <KPICard
        title="Exceptionally Long Metric Title Testing Responsive Flow and Containment"
        value="$999,999,999.00"
        change="+999.9%"
        trend="up"
        badgeText="Super Long Badge Label"
        description="A full multi-line explanation intended to test wrapping behavior inside flex items."
      />
      <KPICard title="Minimal" value="0" />
    </div>
  ),
}
