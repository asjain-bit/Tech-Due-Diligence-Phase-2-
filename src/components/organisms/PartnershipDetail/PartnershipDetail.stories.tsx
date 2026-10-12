import type { Meta, StoryObj } from '@storybook/react'
import { PartnershipDetail } from './PartnershipDetail'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const meta: Meta<typeof PartnershipDetail> = {
  title: 'Organisms/PartnershipDetail',
  component: PartnershipDetail,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof PartnershipDetail>

export const Default: Story = {
  args: {
    request: INITIAL_PARTNERSHIP_REQUESTS[0],
    onBack: () => {},
    onProceed: () => {},
    onReject: () => {},
  },
}

export const Shortlisted: Story = {
  args: {
    request: INITIAL_PARTNERSHIP_REQUESTS[2],
    onBack: () => {},
    onProceed: () => {},
    onReject: () => {},
  },
}
