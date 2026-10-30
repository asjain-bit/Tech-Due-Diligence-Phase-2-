import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'TDD Admin/Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: 'Write your review...',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <Textarea error value="Error message input content" />
      <Textarea disabled value="Disabled textarea content" />
    </div>
  ),
}
