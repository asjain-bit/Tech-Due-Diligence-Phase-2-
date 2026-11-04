import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'TDD Admin/Atoms/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ThemeToggle>

export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
}

export const WithLabel: Story = {
  args: {
    showLabel: true,
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex gap-4">
      <ThemeToggle showLabel />
      <ThemeToggle showLabel className="border-border-focus bg-bg-surface-3" />
    </div>
  ),
}
