import type { Meta, StoryObj } from '@storybook/react'
import { AppDialog } from './AppDialog'

const meta: Meta<typeof AppDialog> = {
  title: 'TDD Admin/Molecules/AppDialog',
  component: AppDialog,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof AppDialog>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Changes',
    children: 'Are you sure you want to apply these configuration settings?',
    confirmLabel: 'Apply',
    onClose: () => {},
    onConfirm: () => {},
  },
}

export const Destructive: Story = {
  args: {
    isOpen: true,
    title: 'Delete Repository',
    children: 'This action cannot be undone. All project files and history will be permanently wiped.',
    confirmLabel: 'Permanently Delete',
    destructive: true,
    onClose: () => {},
    onConfirm: () => {},
  },
}

export const EdgeCases: Story = {
  args: {
    isOpen: true,
    title: 'Overflow Test Dialog Title With Very Long Text',
    children: (
      <div className="max-h-60 overflow-y-auto pr-2">
        <p>Paragraph 1 of long dialog body content...</p>
        <p className="mt-4">Paragraph 2 of long dialog body content...</p>
        <p className="mt-4">Paragraph 3 of long dialog body content...</p>
      </div>
    ),
    onClose: () => {},
  },
}
