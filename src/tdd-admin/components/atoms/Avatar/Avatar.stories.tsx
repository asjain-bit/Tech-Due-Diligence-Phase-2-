import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'TDD Admin/Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    fallback: 'JD',
    size: 'md',
  },
}

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    alt: 'John Doe',
    fallback: 'JD',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar size="sm" fallback="SM" />
      <Avatar size="md" fallback="MD" />
      <Avatar size="lg" fallback="VERY LONG NAME" />
    </div>
  ),
}
