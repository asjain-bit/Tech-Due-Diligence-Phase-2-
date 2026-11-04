import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '@/components/atoms/Select'

const sampleOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
  { value: 'suspended', label: 'Suspended (Disabled)', disabled: true },
]

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    selectSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    hasError: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    options: sampleOptions,
    selectSize: 'md',
  },
}

export const Error: Story = {
  args: {
    options: sampleOptions,
    hasError: true,
  },
}

export const Small: Story = {
  args: {
    options: sampleOptions,
    selectSize: 'sm',
  },
}

export const Large: Story = {
  args: {
    options: sampleOptions,
    selectSize: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    disabled: true,
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Select
        options={[
          {
            value: 'long',
            label:
              'Very long option label that exceeds the conventional display boundary of normal select controls in dashboards',
          },
          { value: 'short', label: 'Short' },
        ]}
      />
      <Select hasError disabled options={sampleOptions} />
      <Select options={[]} aria-label="Empty select options" />
    </div>
  ),
}
