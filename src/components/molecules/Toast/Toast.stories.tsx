import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from '@/components/molecules/Toast'

const meta: Meta<typeof Toast> = {
  title: 'Molecules/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    title: 'Notification',
    description: 'This is a standard system notice.',
    variant: 'default',
    onClose: () => {},
  },
}

export const Success: Story = {
  args: {
    title: 'Deployment Succeeded',
    description: 'Build 4092 is live in the production cluster.',
    variant: 'success',
    onClose: () => {},
  },
}

export const Warning: Story = {
  args: {
    title: 'High Memory Consumption',
    description: 'Container CPU utilization exceeded 85%.',
    variant: 'warning',
    onClose: () => {},
  },
}

export const Error: Story = {
  args: {
    title: 'API Gateway Timeout',
    description: 'Failed to negotiate upstream TLS handshake within 5000ms.',
    variant: 'error',
    onClose: () => {},
  },
}

export const Info: Story = {
  args: {
    title: 'New Integration Available',
    description: 'Connect your Slack workspace for automated rollups.',
    variant: 'info',
    onClose: () => {},
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Toast
        title="Exceptionally verbose title that could stress layout constraints"
        description="A tremendously extended narrative detailing step-by-step diagnostic insights and tracing data to ensure multi-line wraps look great."
        variant="error"
        onClose={() => {}}
      />
      <Toast title="Short toast without description" />
    </div>
  ),
}
