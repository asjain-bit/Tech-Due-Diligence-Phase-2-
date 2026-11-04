import type { Meta, StoryObj } from '@storybook/react'
import { SettingsPanel } from './SettingsPanel'

const meta: Meta<typeof SettingsPanel> = {
  title: 'TDD Admin/Organisms/SettingsPanel',
  component: SettingsPanel,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof SettingsPanel>

export const Default: Story = {
  args: {},
}
