import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@/components/atoms/Input'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    inputSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    hasError: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
    inputSize: 'md',
  },
}

export const Error: Story = {
  args: {
    placeholder: 'Invalid entry',
    hasError: true,
    defaultValue: 'invalid-email',
  },
}

export const Small: Story = {
  args: {
    placeholder: 'Small input',
    inputSize: 'sm',
  },
}

export const Large: Story = {
  args: {
    placeholder: 'Large input',
    inputSize: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Read only text',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input placeholder="Very long placeholder text that exceeds the bounds of standard input boxes..." />
      <Input defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
      <Input hasError disabled defaultValue="Disabled with error state" />
    </div>
  ),
}
