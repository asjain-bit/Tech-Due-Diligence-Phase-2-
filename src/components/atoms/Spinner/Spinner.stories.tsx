import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from '@/components/atoms/Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Loading inline',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Loading full screen',
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Processing payment...',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-4 bg-bg-surface-1 rounded border border-border-default">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <span className="text-text-secondary text-sm">Synchronizing dataset in background...</span>
    </div>
  ),
}
