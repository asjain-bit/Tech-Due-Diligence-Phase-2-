import type { Meta, StoryObj } from '@storybook/react'
import { SiteHeader } from '@/components/organisms/SiteHeader'

const sampleLinks = [
  { label: 'Overview', href: '#overview', active: true },
  { label: 'Deployments', href: '#deployments' },
  { label: 'Security & IAM', href: '#security' },
  { label: 'Observability', href: '#metrics' },
]

const meta: Meta<typeof SiteHeader> = {
  title: 'Organisms/SiteHeader',
  component: SiteHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof SiteHeader>

export const Default: Story = {
  args: {
    title: 'Platform Control Center',
    links: sampleLinks,
    user: {
      name: 'Morgan Stanley',
      role: 'Staff SRE',
    },
  },
}

export const WithUser: Story = {
  args: {
    title: 'Kubernetes Engine',
    links: sampleLinks,
    user: {
      name: 'Sarah Connor',
      role: 'Principal Engineer',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  },
}

export const Minimal: Story = {
  args: {
    title: 'Standalone App',
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SiteHeader
        title="Excessively Broad Tenant Brand Identification Label Testing Flex Shrink"
        links={[
          { label: 'Link 1', href: '#' },
          { label: 'Link 2', href: '#' },
          { label: 'Link 3', href: '#' },
          { label: 'Link 4', href: '#' },
          { label: 'Link 5', href: '#' },
        ]}
        user={{
          name: 'Alexandrina Victoria Frederica von Sachsen-Coburg-Gotha',
          role: 'Global Enterprise Solutions Infrastructure Lead Architect',
        }}
      />
    </div>
  ),
}
