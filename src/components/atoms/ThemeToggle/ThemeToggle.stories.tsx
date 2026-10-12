import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {
  args: {
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4 bg-bg-surface-2 rounded-lg">
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
      <ThemeToggle disabled />
    </div>
  ),
}
