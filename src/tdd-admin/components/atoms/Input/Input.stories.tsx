import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'TDD Admin/Atoms/Input',
  component: Input,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter username...',
  },
}

export const ErrorState: Story = {
  args: {
    placeholder: 'Invalid value...',
    error: true,
    value: 'invalid-email@',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input disabled value="Disabled input text" />
      <Input placeholder="Very long placeholder text inside an input component that tests overflow behavior" />
    </div>
  ),
}
