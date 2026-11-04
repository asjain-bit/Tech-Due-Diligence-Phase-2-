import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  args: {
    activeTab: 'dashboard',
    collapsed: false,
    userName: 'Zaid Al Ali',
    userDesignation: 'Director',
    userEmail: 'zaid.alali@m42.ae',
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {}

export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
}

export const EdgeCases: Story = {
  args: {
    userName: 'A Very Long Executive Profile Name For Stress Testing Overflow',
    userDesignation: 'Legal & Partnership Director With Extensive Sub-Title',
    userEmail: 'extremely.long.executive.email.address@m42.ae',
  },
}
