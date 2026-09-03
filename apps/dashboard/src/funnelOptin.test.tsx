import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BlockRenderer, getBlock } from '@uidesired/blocks'

/**
 * The opt-in a funnel step collects details with.
 *
 * A published step is static HTML at /f/{public_id}/{slug} and the events API
 * is addressed by numeric ids, so publishing writes the ids into a #ud-funnel
 * script tag. Without it the block has no idea which funnel it is on.
 */
function withFunnelContext(next: string | null = 'thanks') {
  const tag = document.createElement('script')
  tag.id = 'ud-funnel'
  tag.type = 'application/json'
  tag.textContent = JSON.stringify({
    funnel_id: 7,
    funnel_slug: 'pub-abc',
    step_id: 12,
    step_slug: 'capture',
    next_step: next,
  })
  document.head.appendChild(tag)
}

function renderOptin(props: Record<string, unknown> = {}) {
  return render(<BlockRenderer type="funnel.optin" props={{ ...getBlock('funnel.optin')!.defaultProps, ...props }} />)
}

function fill(container: HTMLElement, values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector(`input[name="${name}"]`) as HTMLInputElement
    fireEvent.change(input, { target: { value } })
  }
}

describe('funnel.optin', () => {
  const assign = vi.fn()

  beforeEach(() => {
    document.head.innerHTML = ''
    assign.mockReset()
    Object.defineProperty(window, 'location', {
      value: { href: 'https://x.test/f/pub-abc/capture', assign },
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is a form block the palette will show', () => {
    const block = getBlock('funnel.optin')
    expect(block).toBeTruthy()
    expect(block!.category).toBe('form')
  })

  it('always asks for an email, even if it was configured away', () => {
    const { container } = renderOptin({ fields: ['name'] })

    expect(container.querySelector('input[name="email"]')).toBeTruthy()
    expect(container.querySelector('input[name="email"]')?.hasAttribute('required')).toBe(true)
  })

  it('records the lead and moves the visitor to the next step', async () => {
    withFunnelContext('thanks')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { next_step: 'thanks' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { container } = renderOptin()
    fill(container, { name: 'Ada', email: 'ada@example.com' })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/public/funnels/7/steps/12/events')
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.event_type).toBe('lead_created')
    expect(body.metadata.contact).toEqual({ name: 'Ada', email: 'ada@example.com' })

    await waitFor(() => expect(assign).toHaveBeenCalledWith('/f/pub-abc/thanks'))
  })

  it('stays put and says thank you when the funnel has no next step', async () => {
    withFunnelContext(null)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { next_step: null } }) }))

    const { container } = renderOptin({ successMessage: 'Check your inbox.' })
    fill(container, { email: 'ada@example.com' })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(container.textContent).toContain('Check your inbox.'))
    expect(assign).not.toHaveBeenCalled()
  })

  it('says so when the server refuses, rather than pretending it worked', async () => {
    withFunnelContext()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }))

    const { container } = renderOptin()
    fill(container, { email: 'ada@example.com' })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(container.querySelector('[role="alert"]')?.textContent).toContain('did not go through'))
    expect(assign).not.toHaveBeenCalled()
  })

  it('explains itself on a page that is not a published funnel step', async () => {
    // No #ud-funnel tag: this is the editor canvas or a plain page.
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { container } = renderOptin()
    fill(container, { email: 'ada@example.com' })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(container.querySelector('[role="alert"]')?.textContent).toContain('once the funnel is published'))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('swallows a submission that filled the honeypot in', async () => {
    withFunnelContext()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { container } = renderOptin()
    fill(container, { email: 'bot@example.com', website: 'http://spam.test' })
    fireEvent.submit(container.querySelector('form')!)

    // Looks successful to the bot, reaches nothing.
    await waitFor(() => expect(container.textContent).toContain('Thanks'))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
