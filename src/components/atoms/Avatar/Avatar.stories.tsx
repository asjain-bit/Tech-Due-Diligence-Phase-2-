import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from '@/components/atoms/Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    src: { control: 'text' },
    fallback: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: {
    fallback: 'Alex Rivera',
    size: 'md',
  },
}

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    alt: 'Sarah Connor',
    fallback: 'SC',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    fallback: 'John Smith',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    fallback: 'Emma Watson',
    size: 'lg',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="XYZ" size="lg" />
      <Avatar fallback="1" size="sm" />
      <Avatar src="https://broken-image.invalid/test.png" fallback="Fallback Err" />
    </div>
  ),
}
