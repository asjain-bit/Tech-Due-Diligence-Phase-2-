import type { Meta, StoryObj } from '@storybook/react'
import { SettingsPanel } from '@/components/organisms/SettingsPanel'

const meta: Meta<typeof SettingsPanel> = {
  title: 'Organisms/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SettingsPanel>

export const Default: Story = {
  args: {},
}

export const PreFilled: Story = {
  args: {
    initialSettings: {
      username: 'devops.lead',
      email: 'lead@enterprise.cloud',
      bio: 'Leading cloud architecture migration across AWS and Azure environments.',
      region: 'eu-west-1',
      notifications: 'critical',
    },
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="max-w-2xl">
      <SettingsPanel
        initialSettings={{
          username: 'very_long_custom_enterprise_user_handle_that_exceeds_normal_bounds',
          email:
            'ultra_verbose_enterprise_notification_distribution_list_account@subdomain.corp.internal',
          bio: 'Testing multiple paragraphs and extensive bio descriptions inside the textarea control within the form container.',
        }}
      />
    </div>
  ),
}
