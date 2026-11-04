import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'

const meta: Meta<typeof Toast> = {
  title: 'TDD Admin/Molecules/Toast',
  component: Toast,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    title: 'Update Successful',
    description: 'System package versions have been pinned.',
    type: 'success',
  },
}

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-md">
      <Toast title="Success Alert" description="Deployment complete." type="success" />
      <Toast title="Warning Alert" description="Memory usage reaching 85%." type="warning" />
      <Toast title="Error Alert" description="Failed to connect to MSW server." type="error" />
      <Toast title="Info Alert" description="New Next.js 15 features enabled." type="info" />
    </div>
  ),
}

export const EdgeCases: Story = {
  render: () => (
    <Toast
      title="Extremely long toast title that wraps onto multiple lines without causing layout overflow issues"
      description="Detailed long description test"
      type="error"
      onDismiss={() => {}}
    />
  ),
}
