import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'TDD Admin/Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: {
    size: 'md',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
}
