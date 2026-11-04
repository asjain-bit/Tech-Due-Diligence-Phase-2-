import type { Meta, StoryObj } from '@storybook/react'
import { SiteHeader } from './SiteHeader'

const meta: Meta<typeof SiteHeader> = {
  title: 'TDD Admin/Organisms/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof SiteHeader>

export const Default: Story = {
  args: {
    title: 'Atomic Enterprise',
  },
}

export const EdgeCases: Story = {
  args: {
    title: 'Extremely Long Application Name For Branding Test',
  },
}
