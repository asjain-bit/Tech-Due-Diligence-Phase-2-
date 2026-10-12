import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/components/atoms/Badge'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
}

export const Success: Story = {
  args: {
    children: 'Completed',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Pending Review',
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    children: 'Action Required',
    variant: 'error',
  },
}

export const Info: Story = {
  args: {
    children: 'New Feature',
    variant: 'info',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Badge',
    size: 'sm',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-xs">
      <Badge>
        Extremely long badge label that tests wrapping or layout stability in restricted space
      </Badge>
      <Badge variant="success">✓ Verified Tenant</Badge>
      <Badge variant="error">Critical Failure (Code 500)</Badge>
    </div>
  ),
}
