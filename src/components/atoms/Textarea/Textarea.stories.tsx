import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from '@/components/atoms/Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    hasError: { control: 'boolean' },
    disabled: { control: 'boolean' },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: 'Write your notes here...',
    rows: 4,
  },
}

export const Error: Story = {
  args: {
    placeholder: 'Required field',
    hasError: true,
    defaultValue: 'Too short',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
    defaultValue: 'This textarea cannot be edited.',
  },
}

export const ResizeNone: Story = {
  args: {
    placeholder: 'Fixed size textarea',
    resize: 'none',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Textarea
        rows={6}
        defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi."
      />
      <Textarea hasError disabled defaultValue="Disabled with validation error" />
    </div>
  ),
}
