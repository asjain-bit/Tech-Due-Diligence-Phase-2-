import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RequestInfoModal } from './RequestInfoModal'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[0]

describe('RequestInfoModal', () => {
  it('prefills an email to the vendor with the Director’s reason', () => {
    render(
      <RequestInfoModal
        request={request}
        reason="Please share regulatory documents."
        senderName="Zaid Al Ali"
        onSend={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('dialog', { name: /Request more information/i })).toBeInTheDocument()
    expect(screen.getByText(/sarah@medtechinnovations.com/)).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toHaveValue(
      'More information needed: PR-124 MedTech Innovations'
    )
    const body = (screen.getByLabelText('Message') as HTMLTextAreaElement).value
    expect(body).toContain('Hi Sarah Ahmed,')
    expect(body).toContain('Please share regulatory documents.')
    expect(body).toContain('Zaid Al Ali')
    expect(body).toContain('on hold')
  })

  it('sends the edited email', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(
      <RequestInfoModal
        request={request}
        reason="Need docs"
        senderName="Zaid Al Ali"
        onSend={onSend}
        onClose={vi.fn()}
      />
    )
    await user.clear(screen.getByLabelText('Subject'))
    await user.type(screen.getByLabelText('Subject'), 'Quick question')
    await user.click(screen.getByRole('button', { name: /Send & put on hold/i }))
    expect(onSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'sarah@medtechinnovations.com', subject: 'Quick question' })
    )
  })

  it('cannot be sent with an empty subject or message', async () => {
    const user = userEvent.setup()
    render(
      <RequestInfoModal
        request={request}
        reason="Need docs"
        senderName="Zaid"
        onSend={vi.fn()}
        onClose={vi.fn()}
      />
    )
    await user.clear(screen.getByLabelText('Subject'))
    expect(screen.getByRole('button', { name: /Send & put on hold/i })).toBeDisabled()
  })

  it('closes from the button, Cancel and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <RequestInfoModal
        request={request}
        reason="Need docs"
        senderName="Zaid"
        onSend={vi.fn()}
        onClose={onClose}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Close request information' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
