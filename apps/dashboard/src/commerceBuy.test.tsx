import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BlockRenderer, EDIT_PROP, getBlock } from '@uidesired/blocks'

/**
 * The buy button.
 *
 * It shows a price so the shopper can read one, but the charge is taken from
 * the product row on the server, so what is displayed here can never decide
 * what is actually taken.
 */
function renderBuy(props: Record<string, unknown> = {}) {
  return render(
    <BlockRenderer type="commerce.buy" props={{ ...getBlock('commerce.buy')!.defaultProps, ...props }} />,
  )
}

describe('commerce.buy', () => {
  const assign = vi.fn()

  beforeEach(() => {
    assign.mockReset()
    Object.defineProperty(window, 'location', {
      value: { href: 'https://shop.test/buy', assign },
      writable: true,
    })
  })

  it('reads minor units as money', () => {
    const { container } = renderBuy({ price: 4900, currency: 'GBP' })
    expect(container.textContent).toContain('49.00')
  })

  it('does not turn a price into a decimal twice', () => {
    const { container } = renderBuy({ price: 100, currency: 'USD' })
    // 100 minor units is one pound, not one hundred.
    expect(container.textContent).toContain('1.00')
    expect(container.textContent).not.toContain('100.00')
  })

  it('sends the shopper to the page Stripe hosts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { url: 'https://checkout.stripe.com/c/pay/cs_test_1', reference: 'ord_1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { container } = renderBuy({ productId: '42' })
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'bea@example.com' } })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/public/products/42/checkout')

    // No price of any kind leaves the page.
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.email).toBe('bea@example.com')
    expect(body).not.toHaveProperty('price')
    expect(body).not.toHaveProperty('amount')

    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_1'))
  })

  it('repeats what the server said when checkout is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'This shop is not accepting payments yet.' }),
    }))

    const { container } = renderBuy({ productId: '42' })
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'bea@example.com' } })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() =>
      expect(container.querySelector('[role="alert"]')?.textContent).toContain('not accepting payments'),
    )
    expect(assign).not.toHaveBeenCalled()
  })

  it('does not call checkout at all when no product was chosen', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { container } = renderBuy({ productId: '' })
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'bea@example.com' } })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(container.querySelector('[role="alert"]')?.textContent).toContain('Choose a product'))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('warns whoever is building the page, not the shopper', () => {
    const shopper = renderBuy({ productId: '' })
    expect(shopper.container.textContent).not.toContain('No product chosen')

    const builder = renderBuy({ productId: '', [EDIT_PROP]: { commit: () => {}, pickImage: () => {} } })
    expect(builder.container.textContent).toContain('No product chosen')
  })

  it('can sell without asking for an email', () => {
    const { container } = renderBuy({ askForEmail: false })
    expect(container.querySelector('input[name="email"]')).toBeNull()
    expect(container.querySelector('form')).toBeTruthy()
  })
})
