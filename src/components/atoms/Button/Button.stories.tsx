import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/atoms/Button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'destructive', 'outline', 'ghost', 'soft'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Action',
    variant: 'primary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete Resource',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Soft: Story = {
  args: {
    children: 'Soft Button',
    variant: 'soft',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <Button>
        Extremely long text content that might overflow or wrap onto multiple lines inside a small
        container
      </Button>
      <Button disabled>Disabled Button State</Button>
      <Button fullWidth>Full Width Button</Button>
    </div>
  ),
}
