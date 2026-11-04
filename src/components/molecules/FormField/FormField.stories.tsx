import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from '@/components/molecules/FormField'

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    error: { control: 'text' },
    helperText: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof FormField>

export const Default: Story = {
  args: {
    id: 'user-email',
    label: 'Email address',
    helperText: 'We will never share your email.',
  },
}

export const WithError: Story = {
  args: {
    id: 'user-password',
    label: 'Password',
    required: true,
    error: 'Password must be at least 8 characters with numbers and symbols.',
  },
}

export const Required: Story = {
  args: {
    id: 'full-name',
    label: 'Full Name',
    required: true,
    helperText: 'First and last name as shown on legal identity documents.',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <FormField
        id="long-label"
        label="Extremely lengthy descriptive form field label to test word wrap behavior in responsive layouts"
        helperText="Notice how the text neatly folds underneath without causing horizontal scrollbars."
      />
      <FormField
        id="overflow-err"
        label="Account ID"
        required
        error="This is an abnormally comprehensive validation explanation detailing exactly why the input format failed strict validation rules."
      />
    </div>
  ),
}
