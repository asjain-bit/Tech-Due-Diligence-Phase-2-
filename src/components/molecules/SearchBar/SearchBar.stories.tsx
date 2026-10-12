import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from '@/components/molecules/SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof SearchBar>

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Search documentation...',
  },
}

export const Filled: Story = {
  args: {
    value: 'Tailwind CSS tokens',
    placeholder: 'Search...',
  },
}

export const Disabled: Story = {
  args: {
    value: 'Disabled search',
    disabled: true,
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <SearchBar
        value="A super long query string that expands beyond typical viewports and verifies clear button spacing"
        onChange={() => {}}
      />
      <SearchBar value="" onChange={() => {}} placeholder="Short" />
      <SearchBar value="" onChange={() => {}} disabled />
    </div>
  ),
}
