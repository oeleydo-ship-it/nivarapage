import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FunnelAutomation, FunnelStep } from '@uidesired/types'
import { FunnelAutomations } from './FunnelAutomations'

const list = vi.fn()
const create = vi.fn()
const update = vi.fn()
const runs = vi.fn()

vi.mock('../lib/endpoints', () => ({
  automationsApi: {
    list: () => list(),
    create: (funnelId: unknown, body: unknown) => create(funnelId, body),
    update: (funnelId: unknown, id: unknown, body: unknown) => update(funnelId, id, body),
    remove: vi.fn(),
    runs: () => runs(),
  },
}))

const steps = [{ id: 7, name: 'Landing' }] as unknown as FunnelStep[]

const webhookRule: FunnelAutomation = {
  id: 3,
  name: 'Notify ops',
  trigger_event: 'purchase',
  trigger_step_id: null,
  delay_minutes: 0,
  action: 'webhook',
  status: 'active',
  run_count: 2,
  config: { url: 'https://example.com/hook' },
}

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <FunnelAutomations funnelId={11} steps={steps} />
    </QueryClientProvider>,
  )
}

describe('FunnelAutomations', () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue([])
    create.mockReset().mockResolvedValue(webhookRule)
    update.mockReset().mockResolvedValue(webhookRule)
    runs.mockReset().mockResolvedValue([])
  })

  it('keeps the stored signing secret when an edit leaves the field blank', async () => {
    list.mockResolvedValue([webhookRule])
    mount()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    // The secret is what proves a call came from us, so the server never sends
    // it back. Saving without retyping it must not blank it.
    fireEvent.change(screen.getByDisplayValue('Notify ops'), { target: { value: 'Notify ops v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save rule/i }))

    await waitFor(() => expect(update).toHaveBeenCalled())
    const body = update.mock.calls[0][2] as { config: Record<string, unknown> }
    expect(body.config).not.toHaveProperty('secret')
    expect(body.config.url).toBe('https://example.com/hook')
  })

  it('sends the secret when somebody actually types one', async () => {
    list.mockResolvedValue([webhookRule])
    mount()

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByPlaceholderText('Unchanged'), { target: { value: 'topsecret' } })
    fireEvent.click(screen.getByRole('button', { name: /save rule/i }))

    await waitFor(() => expect(update).toHaveBeenCalled())
    expect((update.mock.calls[0][2] as { config: { secret?: string } }).config.secret).toBe('topsecret')
  })

  it('shows why the server refused a rule instead of failing silently', async () => {
    create.mockRejectedValue(new Error('That address is inside a private network.'))
    mount()

    fireEvent.click(await screen.findByRole('button', { name: /new rule/i }))
    fireEvent.change(screen.getByPlaceholderText('Welcome email'), { target: { value: 'Sneaky' } })
    fireEvent.click(screen.getByRole('button', { name: /create rule/i }))

    expect(await screen.findByText(/inside a private network/i)).toBeTruthy()
  })
})
