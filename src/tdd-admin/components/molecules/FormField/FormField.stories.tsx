import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'

const meta: Meta<typeof FormField> = {
  title: 'TDD Admin/Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'user@company.com',
    helperText: 'We will never share your email.',
    required: true,
  },
}

export const ErrorState: Story = {
  args: {
    label: 'Username',
    value: 'usr',
    errorMessage: 'Username must be at least 4 characters long.',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <FormField label="Disabled Field" disabled value="Read only default value" />
      <FormField
        label="Extremely long label description text to verify word break behavior"
        placeholder="Input..."
      />
    </div>
  ),
}
