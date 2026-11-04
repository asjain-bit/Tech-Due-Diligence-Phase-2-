import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'TDD Admin/Molecules/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof SearchBar>

export const Default: Story = {
  args: {
    placeholder: 'Search metrics and logs...',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full">
      <SearchBar value="Pre-filled query" />
      <SearchBar className="max-w-xs" placeholder="Narrow search..." />
    </div>
  ),
}
