import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from '@/components/templates/AppShell'

const meta: Meta<typeof AppShell> = {
  title: 'Templates/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  argTypes: {
    isLeftbarCollapsed: { control: 'boolean' },
    isRightbarOpen: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    topbar: (
      <div className="h-full flex items-center px-4 bg-bg-surface-1 border-b border-border-default font-medium text-sm">
        Header Topbar Slot (56px)
      </div>
    ),
    leftbar: (
      <div className="p-3 text-xs text-text-secondary flex flex-col gap-2">
        <span className="font-semibold text-text-primary">Navigation</span>
        <span>Overview</span>
        <span>Clusters</span>
        <span>Metrics</span>
      </div>
    ),
    main: (
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-xl font-bold text-text-primary">Main Canvas Area</h1>
        <p className="text-sm text-text-secondary">
          AppShell flexible central slot expanding across the viewport.
        </p>
      </div>
    ),
    rightbar: (
      <div className="p-4 text-xs text-text-secondary flex flex-col gap-2">
        <span className="font-semibold text-text-primary">Inspector (~280px)</span>
        <span>Contextual details</span>
      </div>
    ),
    isLeftbarCollapsed: false,
    isRightbarOpen: true,
  },
}

export const CollapsedLeftbar: Story = {
  args: {
    ...Default.args,
    isLeftbarCollapsed: true,
    isRightbarOpen: false,
  },
}

export const EdgeCases: Story = {
  render: () => (
    <AppShell
      topbar={
        <div className="h-full flex items-center justify-between px-4 bg-bg-surface-2 font-mono text-xs">
          <span>MINIMAL_TOPBAR</span>
          <span>56PX</span>
        </div>
      }
      main={
        <div className="p-8">
          <p className="text-sm text-text-secondary">
            Testing layout without optional leftbar and rightbar slots.
          </p>
        </div>
      }
    />
  ),
}
