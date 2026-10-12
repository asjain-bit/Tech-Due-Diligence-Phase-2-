import type { Meta, StoryObj } from '@storybook/react'
import { AppDialog } from '@/components/molecules/AppDialog'
import { Button } from '@/components/atoms/Button'

const meta: Meta<typeof AppDialog> = {
  title: 'Molecules/AppDialog',
  component: AppDialog,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof AppDialog>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Edit Workspace Settings',
    description: 'Update resource allocation and access controls for your organization.',
    onClose: () => {},
    children: 'Dialog inner content goes here with form fields or summaries.',
  },
}

export const WithActions: Story = {
  args: {
    isOpen: true,
    title: 'Delete Tenant Cluster',
    description: 'This operation will immediately terminate all active worker pods.',
    onClose: () => {},
    children: 'Please ensure any persistent storage volumes are backed up before proceeding.',
    actions: (
      <>
        <Button variant="outline" size="md">
          Cancel
        </Button>
        <Button variant="destructive" size="md">
          Delete Permanently
        </Button>
      </>
    ),
  },
}

export const EdgeCases: Story = {
  render: () => (
    <AppDialog
      isOpen={true}
      title="Massive Text Volume Dialogue Verification"
      description="Verifying that scroll containers and modal bounds remain stable across extreme viewport limitations."
      onClose={() => {}}
      actions={
        <Button variant="primary" size="md">
          Acknowledge
        </Button>
      }
    >
      <div className="max-h-60 overflow-y-auto flex flex-col gap-2 text-text-secondary">
        <p>
          Paragraph 1: Testing vertical height saturation and ensure action buttons remain anchored
          at the footer without getting pushed offscreen.
        </p>
        <p>
          Paragraph 2: Additional diagnostic information and legal terms describing data privacy,
          retention requirements, and audit logging mandates.
        </p>
        <p>Paragraph 3: Complete system specifications for the active runtime environment.</p>
      </div>
    </AppDialog>
  ),
}
