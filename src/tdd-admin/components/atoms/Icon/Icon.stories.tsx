import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'TDD Admin/Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: {
    name: 'sun',
    size: 24,
  },
}

export const AllIcons: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Icon name="sun" />
      <Icon name="moon" />
      <Icon name="laptop" />
      <Icon name="search" />
      <Icon name="chevron-down" />
      <Icon name="check" />
      <Icon name="x" />
      <Icon name="user" />
      <Icon name="bell" />
      <Icon name="menu" />
    </div>
  ),
}

export const EdgeCases: Story = {
  render: () => <Icon name="search" size={48} className="text-text-accent" />,
}
