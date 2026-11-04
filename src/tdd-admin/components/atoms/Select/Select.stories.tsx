import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'TDD Admin/Atoms/Select',
  component: Select,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  args: {
    options: [
      { label: 'Light Mode', value: 'light' },
      { label: 'Dark Mode', value: 'dark' },
      { label: 'System Theme', value: 'system' },
    ],
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <Select error options={[{ label: 'Invalid Choice', value: 'invalid' }]} />
      <Select disabled options={[{ label: 'Disabled Choice', value: 'disabled' }]} />
    </div>
  ),
}
