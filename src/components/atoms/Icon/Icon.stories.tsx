import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from '@/components/atoms/Icon'

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'search',
        'sun',
        'moon',
        'laptop',
        'close',
        'chevron-left',
        'chevron-right',
        'chevron-up',
        'chevron-down',
        'check',
        'alert',
        'info',
        'settings',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'search',
    size: 'md',
  },
}

export const Close: Story = {
  args: {
    name: 'close',
    size: 'md',
  },
}

export const Sun: Story = {
  args: {
    name: 'sun',
    size: 'md',
  },
}

export const Moon: Story = {
  args: {
    name: 'moon',
    size: 'md',
  },
}

export const Settings: Story = {
  args: {
    name: 'settings',
    size: 'lg',
  },
}

export const EdgeCases: Story = {
  render: () => {
    const iconNames = [
      'search',
      'sun',
      'moon',
      'laptop',
      'close',
      'chevron-left',
      'chevron-right',
      'chevron-up',
      'chevron-down',
      'check',
      'alert',
      'info',
      'settings',
    ] as const

    return (
      <div className="grid grid-cols-4 gap-4 p-4 border border-border-default rounded-md bg-bg-surface-1">
        {iconNames.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 p-2 border border-border-subtle rounded"
          >
            <Icon name={name} size="lg" />
            <span className="text-xs text-text-tertiary">{name}</span>
          </div>
        ))}
      </div>
    )
  },
}
